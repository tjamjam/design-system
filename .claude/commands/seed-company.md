# /seed-company

Extract brand colors from a URL and wire them into the design system as a new Company.

**Usage:** `/seed-company <url>` (e.g. `/seed-company https://stripe.com`)

## Steps

1. **Run the extractor.** From the repo root:
   ```
   npm run extract:brand $ARGUMENTS
   ```
   If it errors with "Could not determine primary color", stop and ask the user for a fallback hex. Otherwise capture the output — it contains a `companies.ts entry` JSON block and a `globals.css block` CSS block.

2. **Parse the slug.** The JSON's `key` field is the slug (e.g. `stripe`). The CSS block's selector is `[data-company="<slug>"]`. These must match.

3. **Update `src/lib/companies.ts`:**
   - Add the new slug to the `CompanyKey` union (keep alphabetical within the existing order is fine but not required).
   - Insert the JSON object into the `companies: Company[]` array. Drop the trailing comma if it ends up the last entry. Ensure the `font` field is either a valid `FontKey` or `null` (the extractor outputs `null` if no match).

4. **Update `src/app/globals.css`:**
   - Append the CSS block inside the `/* Company overlay */` section, just before the `/* Density */` comment that follows. Keep entries grouped (light-mode block then `.dark` block, then blank line).

5. **Type-check:**
   ```
   npx tsc --noEmit
   ```
   If it fails, read the error and fix — usually a missing `FontKey` value or a malformed union.

6. **Report.** Tell the user:
   - Company name + slug
   - Extracted primary color (hex) + source (which heuristic won — CSS var, meta, saturated color, etc)
   - If the primary came from the weakest heuristic (`most-frequent saturated color`) or looks pale/washed, flag it and suggest hand-tuning the hex in `companies.ts`.
   - Remind them: try `Brand × Company` in the switcher to preview.

## Don't
- Don't commit the change.
- Don't restart the dev server — HMR picks up both files.
- Don't touch `registry.json` — Company seeds are not a shadcn registry concept.
