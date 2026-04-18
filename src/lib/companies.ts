import type { FontKey } from "@/lib/font-options";

export type CompanyKey =
  | "none"
  | "pomelocare"
  | "overstory"
  | "apartmentiq"
  | "hubble";

export type CompanyPalette = {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
  chart1: string;
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

// Seeds extracted via `npm run extract:brand <url>`. Primaries are heuristic —
// you can hand-tune any value here if the site's real brand differs from
// what's exposed in CSS/meta. The CSS blocks live in src/app/globals.css.
export const companies: Company[] = [
  {
    key: "pomelocare",
    name: "Pomelo Care",
    url: "https://www.pomelocare.com/",
    sourceMode: "light",
    light: {
      primary: "#3898ec",
      primaryForeground: "#ffffff",
      accent: "#142fdb1f",
      accentForeground: "#142fdb",
      ring: "#3898ec",
      chart1: "#3898ec",
    },
    dark: {
      primary: "#3898ec",
      primaryForeground: "#ffffff",
      accent: "#6578f12e",
      accentForeground: "#6578f1",
      ring: "#3898ec",
      chart1: "#3898ec",
    },
    font: null,
  },
  {
    key: "overstory",
    name: "Overstory",
    url: "https://www.overstory.com/",
    sourceMode: "light",
    light: {
      primary: "#00b2ff",
      primaryForeground: "#ffffff",
      accent: "#003dcc1f",
      accentForeground: "#003dcc",
      ring: "#00b2ff",
      chart1: "#00b2ff",
    },
    dark: {
      primary: "#00b2ff",
      primaryForeground: "#ffffff",
      accent: "#3370ff2e",
      accentForeground: "#3370ff",
      ring: "#00b2ff",
      chart1: "#00b2ff",
    },
    font: "inter",
  },
  {
    key: "apartmentiq",
    name: "ApartmentIQ",
    url: "https://www.apartmentiq.com/lander",
    sourceMode: "light",
    light: {
      primary: "#b8e4fc",
      primaryForeground: "#0a0a0a",
      accent: "#85a2fa1f",
      accentForeground: "#85a2fa",
      ring: "#b8e4fc",
      chart1: "#b8e4fc",
    },
    dark: {
      primary: "#b8e4fc",
      primaryForeground: "#0a0a0a",
      accent: "#9db5fb2e",
      accentForeground: "#9db5fb",
      ring: "#b8e4fc",
      chart1: "#b8e4fc",
    },
    font: null,
  },
  {
    key: "hubble",
    name: "Hubble",
    url: "https://hubble.com/",
    sourceMode: "light",
    light: {
      primary: "#5761ff",
      primaryForeground: "#ffffff",
      accent: "#6d24ff1f",
      accentForeground: "#6d24ff",
      ring: "#5761ff",
      chart1: "#5761ff",
    },
    dark: {
      primary: "#5761ff",
      primaryForeground: "#ffffff",
      accent: "#b18aff2e",
      accentForeground: "#b18aff",
      ring: "#5761ff",
      chart1: "#5761ff",
    },
    font: null,
  },
];
