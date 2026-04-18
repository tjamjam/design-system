<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Tailwind v4

This project uses Tailwind v4 with the **CSS-based config** in `src/app/globals.css` (`@theme` block). There is intentionally **no** `tailwind.config.ts` / `.js`. Do not add one. Custom tokens, colors, and fonts are declared inside `@theme inline { ... }` at the top of `globals.css`.

Dark mode uses the `.dark` class (via `next-themes attribute="class"`), registered with `@custom-variant dark (&:is(.dark *))` — not `@media (prefers-color-scheme: dark)`.

# Base UI, not Radix

Components come from `@base-ui/react` via shadcn's `base-nova` style. Do not use `asChild` (not supported). Use `render={<Component/>}` + `nativeButton={false}` for non-button renders. See `CLAUDE.md` for the full convention.
