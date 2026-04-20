import * as React from "react";
import type { CompanyKey } from "../lib/companies";
import type { FontSlot } from "../lib/font-options";
import { type A11yLevel } from "../lib/a11y-chart-palette";
export type Brand = "ibm" | "vercel" | "linear";
export type Density = "compact" | "default" | "comfortable";
export type { A11yLevel };
type BrandContextValue = {
    brand: Brand;
    setBrand: (brand: Brand) => void;
    density: Density;
    setDensity: (density: Density) => void;
    font: FontSlot;
    setFont: (font: FontSlot) => void;
    company: CompanyKey;
    setCompany: (company: CompanyKey) => void;
    a11y: A11yLevel;
    setA11y: (level: A11yLevel) => void;
};
type BrandProviderProps = {
    children: React.ReactNode;
    defaultBrand?: Brand;
    defaultDensity?: Density;
    defaultFont?: FontSlot;
    defaultCompany?: CompanyKey;
    defaultA11y?: A11yLevel;
};
export declare function useBrand(): BrandContextValue;
type ThemeProviderProps = BrandProviderProps & {
    /** Initial color mode. Defaults to "light". Forwarded to next-themes. */
    defaultMode?: "light" | "dark" | "system";
};
export declare function ThemeProvider({ children, defaultMode, ...brandProps }: ThemeProviderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=theme-provider.d.ts.map