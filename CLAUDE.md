@AGENTS.md

# design-system

A Next.js 16 component library playground + shadcn registry, used for rapid prototyping and interview demos. Lives at `~/Documents/GitHub/design-system`. Dev server on **port 3031** (not 3000 — there are collisions).

## Stack
- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind v4 (CSS-based config via `@theme` in `globals.css` — **no `tailwind.config.ts`**)
- shadcn CLI with `@base-ui/react` primitives (not Radix) and `base-nova` style
- `next-themes` for light/dark
- Node 22 + npm (not pnpm)

## Theming model

Six orthogonal axes. Each owns its own tokens and should never clobber another's:

| Axis | Attribute | Owns | Values |
| --- | --- | --- | --- |
| Brand | `data-theme` | bg, fg, border, radius, fonts, full palette | `ibm` \| `vercel` \| `linear` |
| Company | `html[data-company]` | `--chart-1` through `--chart-5`, `--primary` (via `var(--chart-1)`), `--primary-foreground`, `--accent`, `--accent-foreground`, `--ring` (+ optional font) | `none` \| seeds in `src/lib/companies.ts` |
| Font | `data-font` | `--font-sans`, `--font-heading` | `default` \| 10 curated Google fonts |
| Density | `data-density` | `height`, `padding` on button/input/select/table | `compact` \| `default` \| `comfortable` |
| A11y | `data-a11y` + runtime JS | `--chart-1` through `--chart-5` (inline `!important` overrides) | `none` \| `aa` \| `aaa` |
| Mode | `.dark` class (via next-themes) | dark-variant palette | light \| dark |

Source order in `globals.css`: brand imports first → company overlay → font overlay → density. Later wins on the properties it defines. **Company selector is `html[data-company]`** (bumped specificity) so it wins against `[data-theme]` regardless of Tailwind layer ordering. **A Company overlay must not define anything outside the listed tokens** or it breaks the mix.

The A11y axis works differently: when `data-a11y="aa"` or `"aaa"`, a `useEffect` in `theme-provider.tsx` reads the current computed `--chart-1..5` and `--background`, runs each chart color through `clampForContrast` (`src/lib/a11y-chart-palette.ts`), and writes the result back as inline styles on `<html>` with `!important`. This wins over every stylesheet rule. Toggling back to `none` clears the inline overrides. Only chart tokens are clamped; semantic tokens (`--success`, `--warning`, `--info`, `--destructive`) are untouched because they already have mode-adaptive derivations.

## Semantic color tokens (critical)

Never reference `--chart-N` for status UI, trend indicators, or any "success/warning/info" meaning — chart tokens are for *charts*. Use the semantic tokens:

- Base per-theme: `--success`, `--warning`, `--info`, `--destructive` (each has a light + dark value in every theme file).
- Auto-derived in both modes: `--{X}-fg`, `--{X}-bg`, `--{X}-border` — defined once in `globals.css` via `color-mix(...)` against black (light mode) or white (dark mode).
- **Components should consume only the derived tokens**, not the base. That way a mode swap, theme swap, or Company overlay all look correct with zero per-component dark-mode code.

Adding a new semantic color: add the base to all three theme files (both light and dark blocks), then add three `color-mix` derivations in `globals.css` (in both `:root` and `.dark`). See the existing `--success` / `--warning` / `--info` blocks as the template.

## Base UI conventions (read this before touching components)

Components use `@base-ui/react`, **not** Radix. API is different:

- **No `asChild`**. Ever. Use `render={<ChildComponent/>}` on `Button`, `DialogTrigger`, `DropdownMenuTrigger`, etc.
- When `render` wraps a non-button (Link, `<a>`), also pass `nativeButton={false}` to silence Base UI's warning.
- Selects emit `onValueChange(value: string | null)` — always coerce: `onValueChange={(v) => v && setX(v)}`.
- Components expose `data-slot="..."` on primitives. Use these for density overrides and cursor styles in `globals.css`, never per-component CSS.

## File map

```
scripts/extract-brand.ts        — CLI: URL → palette + font JSON snippet + CSS block
src/lib/companies.ts            — typed Company registry (seeds)
src/lib/fonts.ts                — next/font declarations (picker-only fonts have preload:false)
src/lib/font-options.ts         — FontKey union + picker metadata (dense vs comfortable tags)
src/components/theme-provider.tsx   — Brand + Company + Font + Density context + localStorage
src/components/theme-switcher.tsx   — the header control
src/app/globals.css             — @theme, font overrides, company overlays, density, semantic derivations
src/app/layout.tsx              — font loading, providers
src/app/page.tsx                — landing + live preview
src/app/playground/page.tsx     — dense B2B dashboard (pipelines table + cards + dialog)
registry/themes/{ibm,vercel,linear}.css — full brand palettes
registry.json                   — shadcn registry manifest
public/r/*.json                 — built registry items (from `npm run registry:build`)
public/fonts/Dolly/             — local Dolly Pro woff2 files
```

## Commands

- `npm run dev` — dev server on :3031 (`PORT=3031 npm run dev`)
- `npm run extract:brand <url>` — prints JSON snippet + CSS block for seeding a new Company
- `npm run registry:build` — generates `public/r/*.json` from `registry.json`
- `/seed-company <url>` — runs the extractor and wires the result into `companies.ts` + `globals.css`
- `/new-theme <name>` — scaffolds a new Brand theme from the IBM template

## Verification rules

- When changing any color, font, or component variant, **screenshot both light AND dark** before claiming done. The mode-adaptive derivations are easy to regress.
- Run `npx tsc --noEmit` before concluding a change — strict mode + Base UI types catch real bugs.
- When touching the theme switcher or provider, cycle through at least one Brand × Company × density × mode combination in the browser to confirm composition still works.

## Style

- No em dashes in user-facing copy (user preference).
- Imperative commit messages, no conventional-commit prefixes, no trailing periods.
- Don't add comments where the code is self-explanatory. Comments should carry *why*, not *what*.
- Don't create `*.md` files unless the user asks — this one is enough.
- Prefer editing over adding files. No new abstractions without a second use case.

## Don't break these

- The CSS selector specificity of `[data-theme="linear"]` and `:root` is equal; theme CSS imports must stay **before** any `:root`/`.dark` fallback blocks or themes stop winning.
- Never add a `:root` block in `globals.css` that re-declares theme tokens — it will override the theme files. Only declare derivations (`--X-fg`/`--X-bg`/`--X-border`) at `:root` level.
- The `tsx` dep must stay in `dependencies`, not `devDependencies`, so `npm run extract:brand` works in any env.
- `--font-geist-mono` is used by every theme as the mono default; don't rename it.
