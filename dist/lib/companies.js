// Public seeds. Additional entries can be added locally without being
// committed by editing this file and the matching CSS block in
// src/app/globals.css, then running:
//   git update-index --skip-worktree src/lib/companies.ts
//   git update-index --skip-worktree src/app/globals.css
// To re-publish real changes to either file, first undo the skip with
// `git update-index --no-skip-worktree <path>` and commit as usual.
export const companies = [
    {
        // IBM Carbon categorical 5-color palette (purple, cyan, teal, magenta, red).
        // Sourced from Carbon's "Color palettes and accessibility features for
        // data visualization", with tuned pairs for light vs dark backgrounds.
        key: "ibm",
        name: "IBM",
        url: "https://www.ibm.com/design/language/color",
        sourceMode: "light",
        light: {
            chart: ["#6929c4", "#1192e8", "#005d5d", "#9f1853", "#fa4d56"],
            primaryForeground: "#ffffff",
            accent: "#e8daff",
            accentForeground: "#491d8b",
            ring: "#6929c4",
        },
        dark: {
            chart: ["#8a3ffc", "#33b1ff", "#007d79", "#ff7eb6", "#fa4d56"],
            primaryForeground: "#ffffff",
            accent: "#2a1f5c",
            accentForeground: "#d4bbff",
            ring: "#8a3ffc",
        },
        font: "ibm-plex-sans",
    },
];
//# sourceMappingURL=companies.js.map