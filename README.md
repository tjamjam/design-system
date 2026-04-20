# @tfradet/design-system

Themeable Next.js component library with five orthogonal axes:

- **Brand** (`data-theme`): IBM, Vercel, Linear. Controls feel: radius, fonts, full palette.
- **Company** (`data-company`): scraped company palettes (chart-1..5 + primary). Can be added via `npm run extract:brand <url>`.
- **Font** (`data-font`): override `--font-sans` globally from a curated Google-fonts list.
- **Density** (`data-density`): compact, default, comfortable. Adjusts control heights.
- **A11y** (`data-a11y`): None, AA, AAA. Runtime-clamps chart tokens for WCAG contrast against the background, and separates palette pairs using Delta E.
- **Mode** (`.dark` class): light / dark, via `next-themes`.

Plus a custom shadcn registry for copy-paste installs, a 5-color palette extractor, and a pile of primitives (Button, Dialog, DataTable, Chart with Recharts, etc).

## Installing in a consumer app

From the consumer (Burlington Beaches, etc):

```bash
npm install git+ssh://git@github.com:tjamjam/design-system.git#v0.1.0
```

For local development without pushing:

```bash
cd design-system
npm run build:pkg
npm pack
# then in the consumer:
npm install file:../design-system/tfradet-design-system-0.1.0.tgz
```

### Next.js setup

Three changes in the consumer project.

**1. Transpile the package.** Next needs to transform the package's ESM source. In `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  transpilePackages: ["@tfradet/design-system"],
};
```

**2. Scan the package for Tailwind classes.** In the consumer's `globals.css`, add an `@source` directive pointing at the compiled package. Without this, utility classes used inside shadcn components (like `fixed`, `top-1/2`, `z-50` on Dialog) don't get compiled, and modals render at the wrong position.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@tfradet/design-system/styles.css";

@source "../../node_modules/@tfradet/design-system/dist";
```

Path is relative to the CSS file's location. If your globals.css is at `src/app/globals.css`, `../../` goes to the project root, then into `node_modules`.

**3. Load fonts and wrap the app.** In `src/app/layout.tsx`:

```tsx
import { fontVariables } from "@tfradet/design-system/fonts";
import { ThemeProvider } from "@tfradet/design-system/provider";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={fontVariables}
      data-theme="vercel"
      data-company="ibm"
      data-density="comfortable"
      data-a11y="aaa"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          defaultMode="system"
          defaultBrand="vercel"
          defaultCompany="ibm"
          defaultDensity="comfortable"
          defaultA11y="aaa"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Using components

```tsx
import { Button } from "@tfradet/design-system/ui/button";
import { Card, CardHeader, CardContent } from "@tfradet/design-system/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@tfradet/design-system/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@tfradet/design-system/ui/chart";
```

### Using tokens directly

The design-system defines these CSS variables. Use them from any component:

- Surface: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--accent`, `--accent-foreground`
- Primary / interactive: `--primary`, `--primary-foreground`
- Categorical chart palette: `--chart-1` through `--chart-5`
- Semantic status (each has `-fg`, `-bg`, `-border` derived automatically): `--success`, `--warning`, `--info`, `--destructive`
- Typography: `--font-sans`, `--font-heading`, `--font-mono`
- Radius: `--radius`

For status UI, always use the `-fg` / `-bg` derived tokens (not the base). They auto-adjust for light and dark mode:

```tsx
<Badge style={{ color: "var(--success-fg)", background: "var(--success-bg)" }}>
  Active
</Badge>
```

## Local dev in this repo

```bash
npm run dev              # playground on :3031
npm run build            # Next build of the playground
npm run build:pkg        # Emit dist/ for package consumers
npm run registry:build   # Emit public/r/*.json for the shadcn CLI
npm run extract:brand <url>   # Extract a 5-color palette from a URL
```

## Release workflow

1. Commit all changes in the design-system repo.
2. Bump `"version"` in `package.json`.
3. `git tag vX.Y.Z && git push && git push --tags`
4. In each consumer, update the dependency:
   ```bash
   npm install git+ssh://git@github.com:tjamjam/design-system.git#vX.Y.Z
   ```

For rapid iteration during development, consumers can pin to `#main` and re-run `npm install` on each change.
