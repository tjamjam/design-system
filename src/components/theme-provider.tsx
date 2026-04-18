"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

import type { CompanyKey } from "@/lib/companies";
import type { FontSlot } from "@/lib/font-options";

export type Brand = "ibm" | "vercel" | "linear";
export type Density = "compact" | "default" | "comfortable";

type BrandContextValue = {
  brand: Brand;
  setBrand: (brand: Brand) => void;
  density: Density;
  setDensity: (density: Density) => void;
  font: FontSlot;
  setFont: (font: FontSlot) => void;
  company: CompanyKey;
  setCompany: (company: CompanyKey) => void;
};

const BrandContext = React.createContext<BrandContextValue | null>(null);

const STORAGE_BRAND = "design-system:brand";
const STORAGE_DENSITY = "design-system:density";
const STORAGE_FONT = "design-system:font";
const STORAGE_COMPANY = "design-system:company";

function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrandState] = React.useState<Brand>("ibm");
  const [density, setDensityState] = React.useState<Density>("default");
  const [font, setFontState] = React.useState<FontSlot>("default");
  const [company, setCompanyState] = React.useState<CompanyKey>("none");

  React.useEffect(() => {
    // One-time hydration of persisted preferences after mount.
    // localStorage isn't available during SSR, so setState in effect is correct here.
    const storedBrand = localStorage.getItem(STORAGE_BRAND) as Brand | null;
    const storedDensity = localStorage.getItem(STORAGE_DENSITY) as Density | null;
    const storedFont = localStorage.getItem(STORAGE_FONT) as FontSlot | null;
    const storedCompany = localStorage.getItem(STORAGE_COMPANY) as CompanyKey | null;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (storedBrand) setBrandState(storedBrand);
    if (storedDensity) setDensityState(storedDensity);
    if (storedFont) setFontState(storedFont);
    if (storedCompany) setCompanyState(storedCompany);
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <BrandProvider>{children}</BrandProvider>
    </NextThemesProvider>
  );
}
