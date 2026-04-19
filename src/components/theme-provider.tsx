"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import * as React from "react";

import type { CompanyKey } from "@/lib/companies";
import type { FontSlot } from "@/lib/font-options";
import {
  computeA11yPalette,
  type A11yLevel,
} from "@/lib/a11y-chart-palette";

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

const BrandContext = React.createContext<BrandContextValue | null>(null);

const STORAGE_BRAND = "design-system:brand";
const STORAGE_DENSITY = "design-system:density";
const STORAGE_FONT = "design-system:font";
const STORAGE_COMPANY = "design-system:company";
const STORAGE_A11Y = "design-system:a11y";

const CHART_SLOTS = [1, 2, 3, 4, 5] as const;

type BrandProviderProps = {
  children: React.ReactNode;
  defaultBrand?: Brand;
  defaultDensity?: Density;
  defaultFont?: FontSlot;
  defaultCompany?: CompanyKey;
  defaultA11y?: A11yLevel;
};

function BrandProvider({
  children,
  defaultBrand = "ibm",
  defaultDensity = "default",
  defaultFont = "default",
  defaultCompany = "none",
  defaultA11y = "none",
}: BrandProviderProps) {
  const { resolvedTheme } = useTheme();
  const [brand, setBrandState] = React.useState<Brand>(defaultBrand);
  const [density, setDensityState] = React.useState<Density>(defaultDensity);
  const [font, setFontState] = React.useState<FontSlot>(defaultFont);
  const [company, setCompanyState] = React.useState<CompanyKey>(defaultCompany);
  const [a11y, setA11yState] = React.useState<A11yLevel>(defaultA11y);

  React.useEffect(() => {
    // One-time hydration of persisted preferences after mount.
    // localStorage isn't available during SSR, so setState in effect is correct here.
    const storedBrand = localStorage.getItem(STORAGE_BRAND) as Brand | null;
    const storedDensity = localStorage.getItem(STORAGE_DENSITY) as Density | null;
    const storedFont = localStorage.getItem(STORAGE_FONT) as FontSlot | null;
    const storedCompany = localStorage.getItem(STORAGE_COMPANY) as CompanyKey | null;
    const storedA11y = localStorage.getItem(STORAGE_A11Y) as A11yLevel | null;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (storedBrand) setBrandState(storedBrand);
    if (storedDensity) setDensityState(storedDensity);
    if (storedFont) setFontState(storedFont);
    if (storedCompany) setCompanyState(storedCompany);
    if (storedA11y) setA11yState(storedA11y);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", brand);
  }, [brand]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  React.useEffect(() => {
    if (font === "default") {
      document.documentElement.removeAttribute("data-font");
    } else {
      document.documentElement.setAttribute("data-font", font);
    }
  }, [font]);

  React.useEffect(() => {
    if (company === "none") {
      document.documentElement.removeAttribute("data-company");
    } else {
      document.documentElement.setAttribute("data-company", company);
    }
  }, [company]);

  React.useEffect(() => {
    if (a11y === "none") {
      document.documentElement.removeAttribute("data-a11y");
    } else {
      document.documentElement.setAttribute("data-a11y", a11y);
    }
  }, [a11y]);

  // A11y runtime pass: only runs when a11y !== "none".
  //   1. Clear prior inline chart-* overrides synchronously so
  //      getComputedStyle returns the stylesheet-level values for the
  //      NEW brand+company selection. Without this, switching Company
  //      while A11y is on would re-clamp the previous company's values
  //      because inline styles shadow stylesheet values in the computed
  //      style read.
  //   2. rAF so the browser has a frame to recompute.
  //   3. Read fresh --chart-* and --background, clamp, write back inline.
  //
  // Inline styles have higher specificity than any stylesheet rule,
  // so plain setProperty (no !important) is sufficient. --primary and
  // --ring are handled in globals.css by the data-company selectors,
  // not here, so the stylesheet stays the source of truth.
  React.useEffect(() => {
    const root = document.documentElement;

    for (const i of CHART_SLOTS) {
      root.style.removeProperty(`--chart-${i}`);
    }

    if (a11y === "none") return;

    const id = requestAnimationFrame(() => {
      const cs = getComputedStyle(root);
      const bg = cs.getPropertyValue("--background").trim();
      if (!bg) return;
      const rawTokens = CHART_SLOTS.map((i) =>
        cs.getPropertyValue(`--chart-${i}`).trim(),
      );
      const adjusted = computeA11yPalette(rawTokens, bg, a11y);
      if (!adjusted) return;
      adjusted.forEach((hex, idx) => {
        if (hex) root.style.setProperty(`--chart-${idx + 1}`, hex);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [a11y, brand, company, resolvedTheme]);

  const setBrand = React.useCallback((next: Brand) => {
    setBrandState(next);
    localStorage.setItem(STORAGE_BRAND, next);
  }, []);

  const setDensity = React.useCallback((next: Density) => {
    setDensityState(next);
    localStorage.setItem(STORAGE_DENSITY, next);
  }, []);

  const setFont = React.useCallback((next: FontSlot) => {
    setFontState(next);
    localStorage.setItem(STORAGE_FONT, next);
  }, []);

  const setCompany = React.useCallback((next: CompanyKey) => {
    setCompanyState(next);
    localStorage.setItem(STORAGE_COMPANY, next);
  }, []);

  const setA11y = React.useCallback((next: A11yLevel) => {
    setA11yState(next);
    localStorage.setItem(STORAGE_A11Y, next);
  }, []);

  return (
    <BrandContext.Provider
      value={{
        brand,
        setBrand,
        density,
        setDensity,
        font,
        setFont,
        company,
        setCompany,
        a11y,
        setA11y,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = React.useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used inside ThemeProvider");
  return ctx;
}

type ThemeProviderProps = BrandProviderProps & {
  /** Initial color mode. Defaults to "light". Forwarded to next-themes. */
  defaultMode?: "light" | "dark" | "system";
};

export function ThemeProvider({
  children,
  defaultMode = "light",
  ...brandProps
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultMode}
      enableSystem={defaultMode === "system"}
    >
      <BrandProvider {...brandProps}>{children}</BrandProvider>
    </NextThemesProvider>
  );
}
