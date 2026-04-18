# /new-theme

Scaffold a new Brand theme from the IBM template.

**Usage:** `/new-theme <brand-name>` (e.g. `/new-theme stripe`)

## Steps

1. **Normalize the name.** From $ARGUMENTS: lowercase, replace spaces with hyphens. Use this as the slug everywhere.

2. **Copy the template.**
   ```
   cp registry/themes/ibm.css registry/themes/<slug>.css
   ```

3. **Rename selectors in the new file.** Replace both:
   - `[data-theme="ibm"]` → `[data-theme="<slug>"]`
   - `.dark[data-theme="ibm"]` → `.dark[data-theme="<slug>"]`

4. **Update `src/app/globals.css`:** Add the import alongside the others, after the existing three:
   ```css
   @import "../../registry/themes/<slug>.css";
   ```
   Order matters for cascade — any theme imported later wins when data-theme attribute is set.

5. **Update `src/components/theme-provider.tsx`:** Add the slug to the `Brand` union type.

6. **Update `src/components/theme-switcher.tsx`:** Add the slug to `brandLabels` with a human-readable label.

7. **Type-check:**
   ```
   npx tsc --noEmit
   ```

8. **Remind the user to hand-tune the new theme file.** IBM's defaults are a starting point. At minimum they should review:
   - `--primary` + `--primary-foreground` (brand color)
   - `--radius` (IBM is 0.125rem / very square; most brands want more)
   - `--font-sans` + `--font-heading` (point at the right `--font-X` variable from `src/lib/fonts.ts`)
   - Dark-mode counterparts — don't leave them identical to IBM's

## Don't
- Don't add the theme to `registry.json` yet — only ship it as a registry item once the palette is finalized.
- Don't add chart tokens without verifying they read sensibly on the theme background.
- Don't forget `--success`, `--warning`, `--info` (semantic tokens) in both light and dark blocks. The mode-adaptive derivations in globals.css depend on them existing per-theme.
