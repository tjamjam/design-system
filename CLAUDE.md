@AGENTS.md

# design-system

A Next.js 16 component library playground + shadcn registry, used for rapid prototyping and interview demos. Lives at `~/Documents/GitHub/design-system`. Dev server on **port 3031** (not 3000, there are collisions).

## Stack
- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind v4 (CSS-based config via `@theme` in `globals.css`, **no `tailwind.config.ts`**)
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
| A11y | `data-a11y` + runtime JS | `--chart-1` through `--chart-5` (inline overrides) | `none` \| `aa` \| `aaa` |
| Mode | `.dark` class (via next-themes) | dark-variant palette | light \| dark |

Source order in `globals.css`: brand imports first, then company overlay, font overlay, density. Later wins on the properties it defines. **Company selector is `html[data-company]` and Font selector is `html[data-font]`** (bumped specificity) so they win against `[data-theme]` regardless of Tailwind layer ordering. Font comes after Company in source so a user font pick wins over a Company's seeded font on the font tokens, while Company still owns chart/primary/accent. **A Company overlay must not define anything outside the listed tokens** or it breaks the mix.

The A11y axis works differently: when `data-a11y="aa"` or `"aaa"`, a `useEffect` in `theme-provider.tsx` reads the current computed `--chart-1..5` and `--background`, runs each chart color through `clampForContrast` (`src/lib/a11y-chart-palette.ts`), and writes the result back as inline styles on `<html>`. Inline styles beat stylesheet rules without needing `!important`. Toggling back to `none` clears the overrides. Only chart tokens are clamped; semantic tokens (`--success`, `--warning`, `--info`, `--destructive`) stay untouched because they already have mode-adaptive derivations.

## Semantic color tokens (critical)

Never reference `--chart-N` for status UI, trend indicators, or any "success/warning/info" meaning. Chart tokens are for *charts*. Use the semantic tokens instead:

- Base per-theme: `--success`, `--warning`, `--info`, `--destructive` (each has a light + dark value in every theme file).
- Auto-derived in both modes: `--{X}-fg`, `--{X}-bg`, `--{X}-border`. Defined once in `globals.css` via `color-mix(...)` against black (light mode) or white (dark mode).
- **Components should consume only the derived tokens**, not the base. That way a mode swap, theme swap, or Company overlay all look correct with zero per-component dark-mode code.

Adding a new semantic color: add the base to all three theme files (both light and dark blocks), then add three `color-mix` derivations in `globals.css` (in both `:root` and `.dark`). See the existing `--success` / `--warning` / `--info` blocks as the template.

## Base UI conventions (read this before touching components)

Components use `@base-ui/react`, **not** Radix. API is different:

- **No `asChild`**. Ever. Use `render={<ChildComponent/>}` on `Button`, `DialogTrigger`, `DropdownMenuTrigger`, etc.
- When `render` wraps a non-button (Link, `<a>`), also pass `nativeButton={false}` to silence Base UI's warning.
- Selects emit `onValueChange(value: string | null)`. Always coerce: `onValueChange={(v) => v && setX(v)}`.
- Components expose `data-slot="..."` on primitives. Use these for density overrides and cursor styles in `globals.css`, never per-component CSS.

## File map

```
scripts/extract-brand.ts            CLI: URL, palette + font JSON snippet + CSS block
src/lib/companies.ts                typed Company registry (seeds)
src/lib/fonts.ts                    next/font declarations (picker-only fonts have preload:false)
src/lib/font-options.ts             FontKey union + picker metadata (dense vs comfortable tags)
src/components/theme-provider.tsx   Brand + Company + Font + Density context + localStorage
src/components/theme-switcher.tsx   the header control
src/app/globals.css                 @theme, font overrides, company overlays, density, semantic derivations
src/app/layout.tsx                  font loading, providers
src/app/page.tsx                    landing + live preview
src/app/playground/page.tsx         dense B2B dashboard (pipelines table + cards + dialog)
registry/themes/{ibm,vercel,linear}.css   full brand palettes
registry.json                       shadcn registry manifest
public/r/*.json                     built registry items (from `npm run registry:build`)
```

## Commands

- `npm run dev`, dev server on :3031 (`PORT=3031 npm run dev`)
- `npm run extract:brand <url>`, prints JSON snippet + CSS block for seeding a new Company
- `npm run registry:build`, generates `public/r/*.json` from `registry.json`
- `npm run build:pkg`, emits `dist/` for consumer projects. Also runs on `npm install` via `prepare`.
- `npm pack`, produces a tarball for local install into a consumer
- `/seed-company <url>`, runs the extractor and wires the result into `companies.ts` + `globals.css`
- `/new-theme <name>`, scaffolds a new Brand theme from the IBM template

## Consuming this package

This repo ships as `@tfradet/design-system` via `git+ssh`. Consumers install with:

```bash
npm install git+ssh://git@github.com:tjamjam/design-system.git#vX.Y.Z
```

Three setup changes the consumer **must** make:

1. **`transpilePackages`** in `next.config.ts`:
   ```ts
   transpilePackages: ["@tfradet/design-system"];
   ```
2. **`@source` directive** in the consumer's `globals.css`, pointing at the compiled package so Tailwind v4 picks up utility classes used inside shadcn components. Without this, `fixed` / `top-1/2` / `z-50` etc. on Dialog don't get compiled and modals render broken:
   ```css
   @import "tailwindcss";
   @import "tw-animate-css";
   @import "shadcn/tailwind.css";
   @import "@tfradet/design-system/styles.css";
   @source "../../node_modules/@tfradet/design-system/dist";
   ```
3. **Font variables + provider** in `src/app/layout.tsx`: import `fontVariables` and `ThemeProvider` from the package, spread `fontVariables` on `<html>`, set `data-theme`/`data-company`/`data-density`/`data-a11y` attributes, wrap children with `<ThemeProvider>` using matching `default*` props.

If a new component lands in the design-system that uses utility classes not already used elsewhere in the package, the consumer's existing `@source` directive picks them up automatically on next build. No manual work.

### Local iteration against a consumer

When iterating on the package against a tarball-installed consumer (e.g. `file:../design-system/tfradet-design-system-0.1.0.tgz`), the flow is:

1. Edit source in design-system
2. `npm run build:pkg && npm pack`
3. In the consumer: `npm install file:../design-system/tfradet-design-system-0.1.0.tgz`
4. **Clear the consumer's `.next/` cache and restart the dev server.** HMR does not invalidate Tailwind v4's `@source` scan of `node_modules`, so the new tarball ships but utility classes used only by the updated component disappear from the compiled CSS until the next cold build. Symptom: the page renders as unstyled HTML after a reinstall. `rm -rf .next && npm run dev` fixes it.

## Keeping private companies out of the public repo

The committed `src/lib/companies.ts` ships with IBM only. Real client
or employer palettes live in the two files `src/lib/companies.ts` and
`src/app/globals.css` locally, but should never be pushed.

The git-native way to let your working copy diverge from the tracked
version without polluting `git status`:

```bash
# Edit both files to add your private company entries, then:
git update-index --skip-worktree src/lib/companies.ts
git update-index --skip-worktree src/app/globals.css
```

From then on git ignores changes to those files. To re-sync with an
upstream change to the tracked version, or to push a genuine edit:

```bash
git update-index --no-skip-worktree src/lib/companies.ts
git update-index --no-skip-worktree src/app/globals.css
# stash or commit your local diff, pull/rebase, then re-apply as needed.
```

`git ls-files -v | grep '^S'` lists files currently in skip-worktree
mode so you do not forget which ones you are hiding.

Prior commits still contain the old private entries. If you need them
gone from history, use `git filter-repo --path src/lib/companies.ts
--path src/app/globals.css --invert-paths` on a clone, then force-push.
Doing that rewrites history, so coordinate with anyone else who has
cloned the repo.

## Release workflow

1. Build: `npm run build:pkg` and confirm `dist/` is current.
2. Commit all changes. Include `dist/` for source-controlled builds, or rely on the `prepare` script building on consumer install.
3. Bump `"version"` in `package.json`.
4. `git tag vX.Y.Z && git push && git push --tags`
5. In each consumer, `npm install git+ssh://...#vX.Y.Z` pulls the new version.

## Verification rules

- When changing any color, font, or component variant, **screenshot both light AND dark** before claiming done. The mode-adaptive derivations are easy to regress.
- Run `npx tsc --noEmit` before concluding a change. Strict mode + Base UI types catch real bugs.
- When touching the theme switcher or provider, cycle through at least one Brand × Company × density × mode combination in the browser to confirm composition still works.

## Style

- No em dashes in user-facing copy (user preference).
- Imperative commit messages, no conventional-commit prefixes, no trailing periods.
- Don't add comments where the code is self-explanatory. Comments should carry *why*, not *what*.
- Don't create `*.md` files unless the user asks. This one is enough.
- Prefer editing over adding files. No new abstractions without a second use case.

## Don't break these

- The CSS selector specificity of `[data-theme="linear"]` and `:root` is equal; theme CSS imports must stay **before** any `:root`/`.dark` fallback blocks or themes stop winning.
- Never add a `:root` block in `globals.css` that re-declares theme tokens. It overrides the theme files. Only declare derivations (`--X-fg`/`--X-bg`/`--X-border`) at `:root` level.
- The `tsx` dep must stay in `dependencies`, not `devDependencies`, so `npm run extract:brand` works in any env.
- `--font-geist-mono` is used by every theme as the mono default; don't rename it.
