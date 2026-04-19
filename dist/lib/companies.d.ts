import type { FontKey } from "@/lib/font-options";
export type CompanyKey = "none" | "ibm" | "pomelocare" | "overstory" | "apartmentiq" | "hubble";
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
export declare const companies: Company[];
//# sourceMappingURL=companies.d.ts.map