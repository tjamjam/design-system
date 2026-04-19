/**
 * extract-brand: pull a 5-color categorical brand palette and font from a URL.
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
const PALETTE_SIZE = 5;
const MIN_HUE_DISTANCE = 30; // degrees

type Mode = "light" | "dark";

type Candidate = { hex: string; score: number; source: string };

type ExtractResult = {
  url: string;
  sourceMode: Mode;
  palette: string[]; // length === PALETTE_SIZE
  paletteSources: string[]; // per-slot provenance
  accent: string | null;
  font: string | null;
  debug: {
    bgSource: string;
    cssSheets: number;
    candidatesConsidered: number;
  };
};

type ChartTuple = [string, string, string, string, string];

type Palette = {
  chart: ChartTuple;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
};

// fetch helpers

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

// CSS helpers

function parseColor(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/;$/, "");
  if (!trimmed) return null;
  const c = colord(trimmed);
  if (!c.isValid()) return null;
  return c.alpha(1).toHex();
}

function isDesignablePrimary(hex: string): boolean {
  const c = colord(hex);
  const { s } = c.toHsl();
  const lum = c.luminance();
  return s > 15 && lum > 0.05 && lum < 0.9;
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
}

function scoreHex(hex: string, frequency: number): number {
  const { s } = colord(hex).toHsl();
  return s * Math.log(frequency + 1);
}

// color candidate collection

function collectNamedVars(
  css: string,
  names: string[],
): Array<{ hex: string; source: string }> {
  const out: Array<{ hex: string; source: string }> = [];
  for (const name of names) {
    const re = new RegExp(
      `--${name.replace(/[-/\\^$*+?.()|[\\]{}]/g, "\\$&")}\\s*:\\s*([^;}{\\n]+)`,
      "gi",
    );
    for (const m of css.matchAll(re)) {
      const hex = parseColor(m[1]);
      if (hex && isDesignablePrimary(hex)) {
        out.push({ hex, source: `--${name}` });
      }
    }
  }
  return out;
}

function collectLiteralColors(css: string): Map<string, number> {
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
  return seen;
}

function collectCandidates(
  css: string,
  metaThemeColor: string | null,
  manifestThemeColor: string | null,
  buttonBg: string | null,
): Candidate[] {
  const bucket = new Map<string, Candidate>();

  const push = (hex: string, source: string, boost = 1) => {
    if (!isDesignablePrimary(hex)) return;
    const existing = bucket.get(hex);
    if (existing) existing.score += boost;
    else bucket.set(hex, { hex, score: boost, source });
  };

  const namedMatches = collectNamedVars(css, [
    "primary",
    "brand",
    "brand-primary",
    "brand-accent",
    "color-primary",
    "color-brand",
    "accent",
    "secondary",
    "brand-secondary",
    "color-accent",
  ]);
  for (const { hex, source } of namedMatches) push(hex, source, 25);

  const numberedRe = /--(color-[a-z]+-\d+|chart-\d+|[a-z]+-\d+)\s*:\s*([^;}{\n]+)/gi;
  for (const m of css.matchAll(numberedRe)) {
    const hex = parseColor(m[2]);
    if (hex) push(hex, `--${m[1]}`, 10);
  }

  if (metaThemeColor) push(metaThemeColor, "meta theme-color", 15);
  if (manifestThemeColor) push(manifestThemeColor, "manifest theme_color", 15);
  if (buttonBg) push(buttonBg, "button background", 12);

  const literals = collectLiteralColors(css);
  for (const [hex, freq] of literals) {
    const weight = scoreHex(hex, freq);
    const existing = bucket.get(hex);
    if (existing) existing.score += weight;
    else bucket.set(hex, { hex, score: weight, source: `literal (${freq}x)` });
  }

  return [...bucket.values()].sort((a, b) => b.score - a.score);
}

function pickHueDiversePalette(
  candidates: Candidate[],
  size: number,
): { palette: string[]; sources: string[] } {
  const palette: string[] = [];
  const sources: string[] = [];
  for (const c of candidates) {
    if (palette.length >= size) break;
    const h = colord(c.hex).toHsl().h;
    const ok = palette.every(
      (p) => hueDistance(colord(p).toHsl().h, h) >= MIN_HUE_DISTANCE,
    );
    if (ok) {
      palette.push(c.hex);
      sources.push(c.source);
    }
  }
  return { palette, sources };
}

function fillWithHueRotation(
  palette: string[],
  sources: string[],
  size: number,
): { palette: string[]; sources: string[] } {
  if (palette.length >= size || palette.length === 0) {
    return { palette, sources };
  }
  const { h, s, l } = colord(palette[0]).toHsl();
  const rotations = [72, 144, 216, 288];
  for (const rot of rotations) {
    if (palette.length >= size) break;
    const candidateHue = (h + rot) % 360;
    const collides = palette.some(
      (p) => hueDistance(colord(p).toHsl().h, candidateHue) < MIN_HUE_DISTANCE,
    );
    if (collides) continue;
    const hex = colord({ h: candidateHue, s, l }).toHex();
    palette.push(hex);
    sources.push(`derived +${rot} deg from chart-1`);
  }
  return { palette, sources };
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

function findCustomProp(
  css: string,
  names: string[],
): { value: string; name: string } | null {
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

function findRootBackground(css: string): string | null {
  const v = findCustomProp(css, ["background", "bg", "color-background"]);
  if (v) return v.value;
  return findSelectorBg(css, ["body", "html", ":root"]);
}

// font detection

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
  const googleFontRe = /fonts\.googleapis\.com\/css2?\?family=([^"'&]+)/gi;
  const matches = [...html.matchAll(googleFontRe)];
  for (const m of matches) {
    const family = decodeURIComponent(m[1]).replace(/\+/g, " ").split(":")[0].trim();
    const key = FONT_KEY_MAP[family.toLowerCase()];
    if (key) return key;
  }
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

// mode derivation

function foregroundFor(hex: string): string {
  return colord(hex).luminance() > 0.5 ? "#0a0a0a" : "#ffffff";
}

function deriveOppositeMode(hex: string, sourceMode: Mode): string {
  const { h, s, l } = colord(hex).toHsl();
  if (sourceMode === "light") {
    return l < 45 ? colord({ h, s, l: 65 }).toHex() : hex;
  }
  return l > 55 ? colord({ h, s, l: 40 }).toHex() : hex;
}

function deriveAccent(primary: string, sourceMode: Mode): string {
  const { h, s, l } = colord(primary).toHsl();
  const shifted = {
    h: (h + 24) % 360,
    s: Math.min(100, s),
    l: sourceMode === "light" ? Math.max(18, l - 10) : Math.min(80, l + 10),
  };
  return colord(shifted).toHex();
}

function buildBothModes(
  sourcePalette: string[],
  sourceMode: Mode,
): { light: Palette; dark: Palette } {
  const toMode = (mode: Mode): ChartTuple => {
    const mapped = sourcePalette.map((c) =>
      mode === sourceMode ? c : deriveOppositeMode(c, sourceMode),
    );
    while (mapped.length < PALETTE_SIZE) mapped.push(mapped[0] ?? "#888888");
    return mapped.slice(0, PALETTE_SIZE) as ChartTuple;
  };

  const lightChart = toMode("light");
  const darkChart = toMode("dark");

  const lightPrimary = lightChart[0];
  const darkPrimary = darkChart[0];

  const lightAccent = deriveAccent(lightPrimary, "light");
  const darkAccent = deriveAccent(darkPrimary, "dark");

  return {
    light: {
      chart: lightChart,
      primaryForeground: foregroundFor(lightPrimary),
      accent: colord(lightAccent).alpha(0.12).toHex(),
      accentForeground: lightAccent,
      ring: lightPrimary,
    },
    dark: {
      chart: darkChart,
      primaryForeground: foregroundFor(darkPrimary),
      accent: colord(darkAccent).alpha(0.18).toHex(),
      accentForeground: darkAccent,
      ring: darkPrimary,
    },
  };
}

// extractor

async function extractBrand(inputUrl: string): Promise<ExtractResult | null> {
  const url = new URL(inputUrl);
  const html = await fetchText(url.toString());
  if (!html) {
    console.error(`Failed to fetch ${url}`);
    return null;
  }

  const $ = cheerio.load(html);

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

  const metaThemeColor = parseColor($('meta[name="theme-color"]').attr("content"));
  let manifestThemeColor: string | null = null;
  let manifestBg: string | null = null;
  const manifestHref = $('link[rel="manifest"]').attr("href");
  if (manifestHref) {
    const manifest = await fetchJson<{ theme_color?: string; background_color?: string }>(
      new URL(manifestHref, url).toString(),
    );
    manifestThemeColor = parseColor(manifest?.theme_color);
    manifestBg = parseColor(manifest?.background_color);
  }
  const buttonBg = findSelectorBg(css, ["button", ".btn", ".Button", "a.button"]);

  const candidates = collectCandidates(css, metaThemeColor, manifestThemeColor, buttonBg);

  if (candidates.length === 0) {
    console.error(`Could not find any designable colors for ${url}`);
    return null;
  }

  const picked = pickHueDiversePalette(candidates, PALETTE_SIZE);
  const filled = fillWithHueRotation(picked.palette, picked.sources, PALETTE_SIZE);

  let bg: string | null = findRootBackground(css);
  let bgSource = "css body/:root";
  if (!bg && metaThemeColor) {
    bg = metaThemeColor;
    bgSource = "meta theme-color (bg fallback)";
  }
  if (!bg && manifestBg) {
    bg = manifestBg;
    bgSource = "manifest background_color";
  }
  const sourceMode: Mode = bg && colord(bg).luminance() < 0.2 ? "dark" : "light";

  const accentVar = findCustomProp(css, ["accent", "brand-accent", "color-accent"]);
  const accent =
    accentVar && accentVar.value !== filled.palette[0] ? accentVar.value : null;

  const font = detectFont(html, css);

  return {
    url: url.toString(),
    sourceMode,
    palette: filled.palette,
    paletteSources: filled.sources,
    accent,
    font,
    debug: {
      bgSource: bg ? bgSource : "defaulted to light",
      cssSheets: sheets.length,
      candidatesConsidered: candidates.length,
    },
  };
}

// render snippet

function slugify(host: string): string {
  return host
    .replace(/^www\./, "")
    .replace(/\.[a-z]+$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();
}

function titleFromHost(host: string): string {
  const base = host.replace(/^www\./, "").split(".")[0];
  return base.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderSnippet(result: ExtractResult) {
  const host = new URL(result.url).hostname;
  const key = slugify(host);
  const name = titleFromHost(host);
  const { light, dark } = buildBothModes(result.palette, result.sourceMode);

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
  --chart-1: ${light.chart[0]};
  --chart-2: ${light.chart[1]};
  --chart-3: ${light.chart[2]};
  --chart-4: ${light.chart[3]};
  --chart-5: ${light.chart[4]};
  --primary: var(--chart-1);
  --primary-foreground: ${light.primaryForeground};
  --accent: ${light.accent};
  --accent-foreground: ${light.accentForeground};
  --ring: var(--chart-1);${
    result.font
      ? `\n  --font-sans: var(--font-${result.font});\n  --font-heading: var(--font-${result.font});`
      : ""
  }
}
.dark[data-company="${key}"] {
  --chart-1: ${dark.chart[0]};
  --chart-2: ${dark.chart[1]};
  --chart-3: ${dark.chart[2]};
  --chart-4: ${dark.chart[3]};
  --chart-5: ${dark.chart[4]};
  --primary-foreground: ${dark.primaryForeground};
  --accent: ${dark.accent};
  --accent-foreground: ${dark.accentForeground};
}`;

  console.log("");
  console.log("Extraction debug");
  console.log(`url:                  ${result.url}`);
  console.log(`source mode:          ${result.sourceMode} (${result.debug.bgSource})`);
  console.log(`stylesheets fetched:  ${result.debug.cssSheets}`);
  console.log(`candidates found:     ${result.debug.candidatesConsidered}`);
  console.log(`font detected:        ${result.font ?? "none"}`);
  console.log(`palette slots:`);
  result.palette.forEach((hex, i) => {
    console.log(`  chart-${i + 1}: ${hex}   (${result.paletteSources[i]})`);
  });
  console.log("");
  console.log("companies.ts entry");
  console.log(JSON.stringify(jsonEntry, null, 2) + ",");
  console.log("");
  console.log("globals.css block");
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
