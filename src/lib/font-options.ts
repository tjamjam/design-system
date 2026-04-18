export type FontSlot = "default" | FontKey;

export type FontKey =
  | "inter"
  | "ibm-plex-sans"
  | "geist"
  | "lexend"
  | "public-sans"
  | "dm-sans"
  | "plus-jakarta-sans"
  | "manrope"
  | "outfit"
  | "figtree";

export type FontOption = {
  key: FontKey;
  label: string;
  density: "dense" | "comfortable";
  note: string;
};

export const fontOptions: FontOption[] = [
  {
    key: "inter",
    label: "Inter",
    density: "dense",
    note: "Product-UI standard. High x-height, tight counters, neutral.",
  },
  {
    key: "ibm-plex-sans",
    label: "IBM Plex Sans",
    density: "dense",
    note: "Editorial yet utilitarian. Strong for enterprise and data tools.",
  },
  {
    key: "geist",
    label: "Geist",
    density: "dense",
    note: "Vercel's font. Precise and modern; great for developer surfaces.",
  },
  {
    key: "lexend",
    label: "Lexend",
    density: "dense",
    note: "Engineered for reading performance; comfortable at small sizes.",
  },
  {
    key: "public-sans",
    label: "Public Sans",
    density: "dense",
    note: "USWDS font. Highly legible for forms, tables, and gov-grade UI.",
  },
  {
    key: "manrope",
    label: "Manrope",
    density: "dense",
    note: "Semi-geometric with narrow counters. Balanced for dashboards.",
  },
  {
    key: "dm-sans",
    label: "DM Sans",
    density: "comfortable",
    note: "Low-contrast geometric. Friendly, great for marketing dense pages.",
  },
  {
    key: "plus-jakarta-sans",
    label: "Plus Jakarta Sans",
    density: "comfortable",
    note: "Warm modern geometric. Works well for products with character.",
  },
  {
    key: "outfit",
    label: "Outfit",
    density: "comfortable",
    note: "Wide counters, airy. Strong for hero and marketing surfaces.",
  },
  {
    key: "figtree",
    label: "Figtree",
    density: "comfortable",
    note: "Modern, friendlier than Inter. Good default for product + marketing.",
  },
];
