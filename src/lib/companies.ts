import type { FontKey } from "./font-options";

export type CompanyKey =
  | "none"
  | "ibm"
  | "pomelocare"
  | "overstory"
  | "apartmentiq"
  | "hubble";

export type CompanyPalette = {
  chart: [string, string, string, string, string];
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
};

export type Company = {
  key: Exclude<CompanyKey, "none">;
  name: string;
  url: string;
  sourceMode: "light" | "dark";
  light: CompanyPalette;
  dark: CompanyPalette;
  font: FontKey | null;
};

// Seeds extracted via `npm run extract:brand <url>`. The chart tuple is a
// categorical palette (chart-1 through chart-5) picked for hue diversity.
// Hand-tune any value here if the site's real brand differs from what's
// exposed in CSS. The CSS blocks live in src/app/globals.css.
export const companies: Company[] = [
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
  {
    key: "pomelocare",
    name: "Pomelo Care",
    url: "https://www.pomelocare.com/",
    sourceMode: "light",
    light: {
      chart: ["#3898ec", "#f5a799", "#6248ff", "#be4aa5", "#b036ec"],
      primaryForeground: "#ffffff",
      accent: "#142fdb1f",
      accentForeground: "#142fdb",
      ring: "#3898ec",
    },
    dark: {
      chart: ["#3898ec", "#f5a799", "#6248ff", "#be4aa5", "#b036ec"],
      primaryForeground: "#ffffff",
      accent: "#6578f12e",
      accentForeground: "#6578f1",
      ring: "#3898ec",
    },
    font: null,
  },
  {
    key: "overstory",
    name: "Overstory",
    url: "https://www.overstory.com/",
    sourceMode: "light",
    light: {
      chart: ["#00b2ff", "#f0523d", "#7dbb00", "#ae81ff", "#00ab6c"],
      primaryForeground: "#ffffff",
      accent: "#003dcc1f",
      accentForeground: "#003dcc",
      ring: "#00b2ff",
    },
    dark: {
      chart: ["#00b2ff", "#f0523d", "#c4ff4d", "#ae81ff", "#4dffbe"],
      primaryForeground: "#ffffff",
      accent: "#3370ff2e",
      accentForeground: "#3370ff",
      ring: "#00b2ff",
    },
    font: "inter",
  },
  {
    key: "apartmentiq",
    name: "ApartmentIQ",
    url: "https://www.apartmentiq.com/lander",
    sourceMode: "light",
    light: {
      chart: ["#b8e4fc", "#8dc63f", "#dcb6fc", "#fcb6c7", "#b6fcc0"],
      primaryForeground: "#0a0a0a",
      accent: "#85a2fa1f",
      accentForeground: "#85a2fa",
      ring: "#b8e4fc",
    },
    dark: {
      chart: ["#b8e4fc", "#8dc63f", "#dcb6fc", "#fcb6c7", "#b6fcc0"],
      primaryForeground: "#0a0a0a",
      accent: "#9db5fb2e",
      accentForeground: "#9db5fb",
      ring: "#b8e4fc",
    },
    font: null,
  },
  {
    key: "hubble",
    name: "Hubble",
    url: "https://hubble.com/",
    sourceMode: "light",
    light: {
      chart: ["#5761ff", "#8c30dc", "#ffdd75", "#911f8a", "#dd4141"],
      primaryForeground: "#ffffff",
      accent: "#6d24ff1f",
      accentForeground: "#6d24ff",
      ring: "#5761ff",
    },
    dark: {
      chart: ["#5761ff", "#8c30dc", "#ffdd75", "#e06cd8", "#dd4141"],
      primaryForeground: "#ffffff",
      accent: "#b18aff2e",
      accentForeground: "#b18aff",
      ring: "#5761ff",
    },
    font: null,
  },
];
