#!/usr/bin/env node
/**
 * bundle-styles: produce dist/styles.css for consumers.
 *
 * Reads src/app/globals.css and inlines LOCAL @import statements (paths
 * starting with . or /). Leaves NODE-MODULE imports (tailwindcss,
 * tw-animate-css, shadcn/tailwind.css) intact so the consumer's bundler
 * resolves them against its own node_modules (our deps are hoisted).
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ENTRY = resolve(ROOT, "src/app/globals.css");
const OUT_DIR = resolve(ROOT, "dist");
const OUT_FILE = resolve(OUT_DIR, "styles.css");

const IMPORT_RE = /^\s*@import\s+["']([^"']+)["']\s*;?\s*$/;

// These imports belong to the consumer's CSS pipeline, not ours. Stripping
// them from the bundle ensures Tailwind's content scanning runs in the
// consumer's context (reading the consumer's src/) rather than in ours.
const STRIP_IMPORTS = new Set([
  "tailwindcss",
  "tw-animate-css",
  "shadcn/tailwind.css",
]);

async function inlineLocalImports(entryPath, visited = new Set()) {
  const absEntry = resolve(entryPath);
  if (visited.has(absEntry)) {
    return `/* cyclic import skipped: ${absEntry} */\n`;
  }
  visited.add(absEntry);

  const raw = await readFile(absEntry, "utf8");
  const entryDir = dirname(absEntry);
  const lines = raw.split("\n");
  const out = [];

  for (const line of lines) {
    const m = line.match(IMPORT_RE);
    if (!m) {
      out.push(line);
      continue;
    }
    const target = m[1];
    if (STRIP_IMPORTS.has(target)) {
      out.push(`/* stripped consumer-owned import: ${target} */`);
      continue;
    }
    const isLocal =
      target.startsWith("./") || target.startsWith("../") || target.startsWith("/");
    if (!isLocal) {
      // Any other node-module import stays as-is for the consumer's bundler.
      out.push(line);
      continue;
    }
    const resolved = resolve(entryDir, target);
    const inlined = await inlineLocalImports(resolved, visited);
    out.push(`/* inlined from ${target} */`);
    out.push(inlined);
    out.push(`/* end ${target} */`);
  }

  return out.join("\n");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const bundled = await inlineLocalImports(ENTRY);
  const header = [
    "/**",
    " * @tfradet/design-system/styles.css",
    " * Bundled by scripts/bundle-styles.mjs. Do not edit by hand.",
    " * Source of truth: src/app/globals.css",
    " */",
    "",
  ].join("\n");
  await writeFile(OUT_FILE, header + bundled, "utf8");
  console.log(`[bundle-styles] wrote ${OUT_FILE} (${bundled.length} chars)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
