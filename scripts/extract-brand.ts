/**
 * extract-brand — pull brand colors + font from a URL and emit a seed snippet.
 *
 * Usage: npm run extract:brand https://www.example.com
 *
 * Output:
 *   1. JSON snippet ready to paste into src/lib/companies.ts
 *   2. CSS block ready to paste into src/app/globals.css
 */

import * as cheerio from "cheerio";
import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin, a11yPlugin]);

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const FETCH_TIMEOUT_MS = 8_000;
const MAX_STYLESHEETS = 10;

type Mode = "light" | "dark";

type ExtractResult = {
  url: string;
  sourceMode: Mode;
  primary: string;
  accent: string | null;
  font: string | null;
  debug: {
    primarySource: string;
    bgSource: string;
    cssSheets: number;
  };
};

type Palette = {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
  chart1: string;
};

// ---------- fetch helpers ----------

async function fetchText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,text/css,*/*" },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(to);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchJson<T = unknown>(url: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(to);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ---------- CSS helpers ----------

function parseColor(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/;$/, "");
  if (!trimmed) return null;
  const c = colord(trimmed);
  if (!c.isValid()) return null;
  // Strip alpha — brand primaries should be fully opaque
  return c.alpha(1).toHex();
}

function isDesignablePrimary(hex: string): boolean {
  const c = colord(hex);
  const { s } = c.toHsl();
  const lum = c.luminance();
  // Reject near-white, near-black, and washed-out grays
  return s > 15 && lum > 0.05 && lum < 0.9;
}

function findMostSaturatedColor(css: string): string | null {
  const hexRe = /#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi;
  const rgbRe = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+[^)]*\)/gi;
  const seen = new Map<string, number>();
  for (const m of css.match(hexRe) ?? []) {
    const hex = parseColor(m);
    if (!hex || !isDesignablePrimary(hex)) continue;
    seen.set(hex, (seen.get(hex) ?? 0) + 1);
  }
  for (const m of css.match(rgbRe) ?? []) {
    const hex = parseColor(m);
    if (!hex || !isDesignablePrimary(hex)) continue;
    seen.set(hex, (seen.get(hex) ?? 0) + 1);
  }
  if (seen.size === 0) return null;
  // Score = saturation × log(frequency+1). Favors saturated colors but
  // still rewards ones that actually appear on the site.
  return [...seen.entries()]
    .map(([hex, n]) => {
      const { s } = colord(hex).toHsl();
      return { hex, score: s * Math.log(n + 1) };
    })
    .sort((a, b) => b.score - a.score)[0].hex;
}

function findCustomProp(css: string, names: string[]): { value: string; name: string } | null {
  for (const name of names) {
    const re = new RegExp(
      `--${name.replace(/[-/\\^$*+?.()|[\\]{}]/g, "\\$&")}\\s*:\\s*([^;}{\\n]+)`,
      "i",
    );
    const m = css.match(re);
    if (m) {
      const color = parseColor(m[1]);
      if (color) return { value: color, name: `--${name}` };
    }
  }
  return null;
}

function findSelectorBg(css: string, selectors: string[]): string | null {
  for (const sel of selectors) {
    const re = new RegExp(
      `${sel.replace(/[-/\\^$*+?.()|[\\]{}]/g, "\\$&")}\\s*{[^}]*background(?:-color)?\\s*:\\s*([^;}]+)`,
      "i",
    );
    const m = css.match(re);
    if (m) {
      const color = parseColor(m[1]);
      if (color) return color;
    }
  }
  return null;
}

function findRootBackground(css: string): string | null {
  const v = findCustomProp(css, ["background", "bg", "color-background"]);
  if (v) return v.value;
  return findSelectorBg(css, ["body", "html", ":root"]);
}

// ---------- font detection ----------

const FONT_KEY_MAP: Record<string, string> = {
  inter: "inter",
  "ibm plex sans": "ibm-plex-sans",
  geist: "geist",
  lexend: "lexend",
  "public sans": "public-sans",
  manrope: "manrope",
  "dm sans": "dm-sans",
  "plus jakarta sans": "plus-jakarta-sans",
  outfit: "outfit",
  figtree: "figtree",
};

function detectFont(html: string, css: string): string | null {
  // 1) Google Fonts link
  const googleFontRe = /fonts\.googleapis\.com\/css2?\?family=([^"'&]+)/gi;
  const matches = [...html.matchAll(googleFontRe)];
  for (const m of matches) {
    const family = decodeURIComponent(m[1]).replace(/\+/g, " ").split(":")[0].trim();
    const key = FONT_KEY_MAP[family.toLowerCase()];
    if (key) return key;
  }
  // 2) font-family declarations in CSS
  const ffRe = /font-family\s*:\s*([^;}{]+)/gi;
  for (const m of css.matchAll(ffRe)) {
    const first = m[1]
      .split(",")[0]
      .trim()
      .replace(/["']/g, "")
      .toLowerCase();
    if (FONT_KEY_MAP[first]) return FONT_KEY_MAP[first];
  }
  return null;
}

// ---------- derivation ----------

function foregroundFor(hex: string): string {
  // WCAG relative luminance, 0.5 threshold
  return colord(hex).luminance() > 0.5 ? "#0a0a0a" : "#ffffff";
}

function deriveAccent(primary: string, sourceMode: Mode): string {
  const c = colord(primary);
  const h = c.toHsl();
  const shifted = {
    ...h,
    h: (h.h + 24) % 360,
    s: Math.min(100, h.s),
    l: sourceMode === "light" ? Math.max(18, h.l - 10) : Math.min(80, h.l + 10),
  };
  return colord(shifted).toHex();
}

function deriveOppositeModePrimary(primary: string, sourceMode: Mode): string {
  const c = colord(primary);
  const h = c.toHsl();
  if (sourceMode === "light") {
    // Produce dark-mode variant: if too dark, bump up to ~65%
    return h.l < 45 ? colord({ ...h, l: 65 }).toHex() : primary;
  }
  // sourceMode === "dark": produce light-mode variant
  return h.l > 55 ? colord({ ...h, l: 40 }).toHex() : primary;
}

function buildPalette(primary: string, sourceMode: Mode): {
  light: Palette;
  dark: Palette;
} {
  const lightPrimary = sourceMode === "light" ? primary : deriveOppositeModePrimary(primary, sourceMode);
  const darkPrimary = sourceMode === "dark" ? primary : deriveOppositeModePrimary(primary, sourceMode);

  const lightAccent = deriveAccent(lightPrimary, "light");
  const darkAccent = deriveAccent(darkPrimary, "dark");

  return {
    light: {
      primary: lightPrimary,
      primaryForeground: foregroundFor(lightPrimary),
      accent: colord(lightAccent).alpha(0.12).toHex(),
      accentForeground: lightAccent,
      ring: lightPrimary,
      chart1: lightPrimary,
    },
    dark: {
      primary: darkPrimary,
      primaryForeground: foregroundFor(darkPrimary),
      accent: colord(darkAccent).alpha(0.18).toHex(),
      accentForeground: darkAccent,
      ring: darkPrimary,
      chart1: darkPrimary,
    },
  };
}

// ---------- extractor ----------

async function extractBrand(inputUrl: string): Promise<ExtractResult | null> {
  const url = new URL(inputUrl);
  const html = await fetchText(url.toString());
  if (!html) {
    console.error(`Failed to fetch ${url}`);
    return null;
  }

  const $ = cheerio.load(html);

  // gather CSS
  const cssChunks: string[] = [];
  $("style").each((_, el) => {
    cssChunks.push($(el).text());
  });

  const linkHrefs: string[] = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) linkHrefs.push(new URL(href, url).toString());
  });

  const sheets = linkHrefs.slice(0, MAX_STYLESHEETS);
  const fetched = await Promise.all(sheets.map(fetchText));
  for (const css of fetched) {
    if (css) cssChunks.push(css);
  }
  const css = cssChunks.join("\n\n");

  // ----- primary candidates -----
  let primary: string | null = null;
  let primarySource = "none";

  const accept = (hex: string | null, source: string) => {
    if (!hex) return false;
    if (!isDesignablePrimary(hex)) return false;
    primary = hex;
    primarySource = source;
    return true;
  };

  const fromVar = findCustomProp(css, [
    "primary",
    "brand",
    "brand-primary",
    "color-primary",
    "color-brand",
    "accent",
  ]);
  if (fromVar) accept(fromVar.value, `css custom property ${fromVar.name}`);

  if (!primary) {
    const themeColor = $('meta[name="theme-color"]').attr("content");
    accept(parseColor(themeColor), "meta theme-color");
  }

  if (!primary) {
    const manifestHref = $('link[rel="manifest"]').attr("href");
    if (manifestHref) {
      const manifest = await fetchJson<{ theme_color?: string; background_color?: string }>(
        new URL(manifestHref, url).toString(),
      );
      accept(parseColor(manifest?.theme_color), "manifest theme_color");
    }
  }

  if (!primary) {
    const btnBg = findSelectorBg(css, ["button", ".btn", ".Button", "a.button"]);
    accept(btnBg, "button background");
  }

  if (!primary) {
    const saturated = findMostSaturatedColor(css);
    accept(saturated, "most-frequent saturated color");
  }

  if (!primary) {
    console.error(`Could not determine primary color for ${url}`);
    return null;
  }

  // ----- source mode -----
  let bg: string | null = findRootBackground(css);
  let bgSource = "css body/:root";
  if (!bg) {
    const themeColor = $('meta[name="theme-color"]').attr("content");
    bg = parseColor(themeColor);
    if (bg) bgSource = "meta theme-color (bg fallback)";
  }
  if (!bg) {
    const manifestHref = $('link[rel="manifest"]').attr("href");
    if (manifestHref) {
      const manifest = await fetchJson<{ background_color?: string }>(
        new URL(manifestHref, url).toString(),
      );
      const parsed = parseColor(manifest?.background_color);
      if (parsed) {
        bg = parsed;
        bgSource = "manifest background_color";
      }
    }
  }
  const sourceMode: Mode = bg && colord(bg).luminance() < 0.2 ? "dark" : "light";

  // ----- accent -----
  const accentVar = findCustomProp(css, ["accent", "brand-accent", "color-accent"]);
  const accent = accentVar && accentVar.value !== primary ? accentVar.value : null;

  // ----- font -----
  const font = detectFont(html, css);

  return {
    url: url.toString(),
    sourceMode,
    primary,
    accent,
    font,
    debug: {
      primarySource,
      bgSource: bg ? bgSource : "defaulted to light",
      cssSheets: sheets.length,
    },
  };
}

// ---------- render snippet ----------

function slugify(host: string): string {
  return host.replace(/^www\./, "").replace(/\.[a-z]+$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function titleFromHost(host: string): string {
  const base = host.replace(/^www\./, "").split(".")[0];
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderSnippet(result: ExtractResult) {
  const host = new URL(result.url).hostname;
  const key = slugify(host);
  const name = titleFromHost(host);
  const { light, dark } = buildPalette(result.primary, result.sourceMode);

  const jsonEntry = {
    key,
    name,
    url: result.url,
    sourceMode: result.sourceMode,
    light,
    dark,
    font: result.font,
  };

  const cssBlock = `[data-company="${key}"] {
  --primary: ${light.primary};
  --primary-foreground: ${light.primaryForeground};
  --accent: ${light.accent};
  --accent-foreground: ${light.accentForeground};
  --ring: ${light.ring};
  --chart-1: ${light.chart1};${
    result.font
      ? `\n  --font-sans: var(--font-${result.font});\n  --font-heading: var(--font-${result.font});`
      : ""
  }
}
.dark[data-company="${key}"] {
  --primary: ${dark.primary};
  --primary-foreground: ${dark.primaryForeground};
  --accent: ${dark.accent};
  --accent-foreground: ${dark.accentForeground};
  --ring: ${dark.ring};
  --chart-1: ${dark.chart1};
}`;

  console.log("");
  console.log("─── Extraction debug ────────────────────────────────────────");
  console.log(`url:            ${result.url}`);
  console.log(`primary source: ${result.debug.primarySource}`);
  console.log(`bg source:      ${result.debug.bgSource}`);
  console.log(`source mode:    ${result.sourceMode}`);
  console.log(`stylesheets:    ${result.debug.cssSheets}`);
  console.log(`font detected:  ${result.font ?? "none"}`);
  console.log("");
  console.log("─── companies.ts entry ──────────────────────────────────────");
  console.log(JSON.stringify(jsonEntry, null, 2) + ",");
  console.log("");
  console.log("─── globals.css block ───────────────────────────────────────");
  console.log(cssBlock);
  console.log("");
}

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: npm run extract:brand <url>");
    process.exit(1);
  }
  const url = /^https?:\/\//.test(target) ? target : `https://${target}`;
  const result = await extractBrand(url);
  if (!result) process.exit(1);
  renderSnippet(result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
