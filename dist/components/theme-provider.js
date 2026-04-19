"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import * as React from "react";
import { computeA11yPalette, } from "@/lib/a11y-chart-palette";
const BrandContext = React.createContext(null);
const STORAGE_BRAND = "design-system:brand";
const STORAGE_DENSITY = "design-system:density";
const STORAGE_FONT = "design-system:font";
const STORAGE_COMPANY = "design-system:company";
const STORAGE_A11Y = "design-system:a11y";
const CHART_SLOTS = [1, 2, 3, 4, 5];
function BrandProvider({ children, defaultBrand = "ibm", defaultDensity = "default", defaultFont = "default", defaultCompany = "none", defaultA11y = "none", }) {
    const { resolvedTheme } = useTheme();
    const [brand, setBrandState] = React.useState(defaultBrand);
    const [density, setDensityState] = React.useState(defaultDensity);
    const [font, setFontState] = React.useState(defaultFont);
    const [company, setCompanyState] = React.useState(defaultCompany);
    const [a11y, setA11yState] = React.useState(defaultA11y);
    React.useEffect(() => {
        // One-time hydration of persisted preferences after mount.
        // localStorage isn't available during SSR, so setState in effect is correct here.
        const storedBrand = localStorage.getItem(STORAGE_BRAND);
        const storedDensity = localStorage.getItem(STORAGE_DENSITY);
        const storedFont = localStorage.getItem(STORAGE_FONT);
        const storedCompany = localStorage.getItem(STORAGE_COMPANY);
        const storedA11y = localStorage.getItem(STORAGE_A11Y);
        /* eslint-disable react-hooks/set-state-in-effect */
        if (storedBrand)
            setBrandState(storedBrand);
        if (storedDensity)
            setDensityState(storedDensity);
        if (storedFont)
            setFontState(storedFont);
        if (storedCompany)
            setCompanyState(storedCompany);
        if (storedA11y)
            setA11yState(storedA11y);
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
        }
        else {
            document.documentElement.setAttribute("data-font", font);
        }
    }, [font]);
    React.useEffect(() => {
        if (company === "none") {
            document.documentElement.removeAttribute("data-company");
        }
        else {
            document.documentElement.setAttribute("data-company", company);
        }
    }, [company]);
    React.useEffect(() => {
        if (a11y === "none") {
            document.documentElement.removeAttribute("data-a11y");
        }
        else {
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
        if (a11y === "none")
            return;
        const id = requestAnimationFrame(() => {
            const cs = getComputedStyle(root);
            const bg = cs.getPropertyValue("--background").trim();
            if (!bg)
                return;
            const rawTokens = CHART_SLOTS.map((i) => cs.getPropertyValue(`--chart-${i}`).trim());
            const adjusted = computeA11yPalette(rawTokens, bg, a11y);
            if (!adjusted)
                return;
            adjusted.forEach((hex, idx) => {
                if (hex)
                    root.style.setProperty(`--chart-${idx + 1}`, hex);
            });
        });
        return () => cancelAnimationFrame(id);
    }, [a11y, brand, company, resolvedTheme]);
    const setBrand = React.useCallback((next) => {
        setBrandState(next);
        localStorage.setItem(STORAGE_BRAND, next);
    }, []);
    const setDensity = React.useCallback((next) => {
        setDensityState(next);
        localStorage.setItem(STORAGE_DENSITY, next);
    }, []);
    const setFont = React.useCallback((next) => {
        setFontState(next);
        localStorage.setItem(STORAGE_FONT, next);
    }, []);
    const setCompany = React.useCallback((next) => {
        setCompanyState(next);
        localStorage.setItem(STORAGE_COMPANY, next);
    }, []);
    const setA11y = React.useCallback((next) => {
        setA11yState(next);
        localStorage.setItem(STORAGE_A11Y, next);
    }, []);
    return (_jsx(BrandContext.Provider, { value: {
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
        }, children: children }));
}
export function useBrand() {
    const ctx = React.useContext(BrandContext);
    if (!ctx)
        throw new Error("useBrand must be used inside ThemeProvider");
    return ctx;
}
export function ThemeProvider({ children, defaultMode = "light", ...brandProps }) {
    return (_jsx(NextThemesProvider, { attribute: "class", defaultTheme: defaultMode, enableSystem: defaultMode === "system", children: _jsx(BrandProvider, { ...brandProps, children: children }) }));
}
//# sourceMappingURL=theme-provider.js.map