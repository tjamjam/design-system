"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "./ui/select";
import { useBrand, } from "./theme-provider";
import { companies } from "../lib/companies";
import { fontOptions } from "../lib/font-options";
const brandLabels = {
    ibm: "IBM",
    vercel: "Vercel",
    linear: "Linear",
};
const densityLabels = {
    compact: "Compact",
    default: "Default",
    comfortable: "Comfortable",
};
const a11yLabels = {
    none: "None",
    aa: "AA",
    aaa: "AAA",
};
export function ThemeSwitcher() {
    const { brand, setBrand, density, setDensity, font, setFont, company, setCompany, a11y, setA11y, } = useBrand();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    // Standard next-themes pattern: mounted flag prevents hydration mismatch
    // on the light/dark toggle icon. setState-in-effect is the documented approach.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    React.useEffect(() => setMounted(true), []);
    const current = mounted ? (resolvedTheme ?? theme ?? "light") : "light";
    return (_jsxs("div", { className: "flex flex-wrap items-end gap-3", children: [_jsx(Field, { label: "Brand", htmlFor: "theme-brand", children: _jsxs(Select, { value: brand, onValueChange: (v) => v && setBrand(v), children: [_jsx(SelectTrigger, { id: "theme-brand", className: "w-[130px]", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(brandLabels).map(([value, label]) => (_jsx(SelectItem, { value: value, children: label }, value))) })] }) }), _jsx(Field, { label: "Company", htmlFor: "theme-company", children: _jsxs(Select, { value: company, onValueChange: (v) => v && setCompany(v), children: [_jsx(SelectTrigger, { id: "theme-company", className: "w-[160px]", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "none", children: "None" }), companies.map((c) => (_jsx(SelectItem, { value: c.key, children: c.name }, c.key)))] })] }) }), _jsx(Field, { label: "Font", htmlFor: "theme-font", children: _jsxs(Select, { value: font, onValueChange: (v) => v && setFont(v), children: [_jsx(SelectTrigger, { id: "theme-font", className: "w-[190px]", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { className: "max-h-[380px]", children: [_jsx(SelectItem, { value: "default", children: "Theme default" }), _jsx(FontGroup, { label: "Dense B2B", children: fontOptions
                                        .filter((o) => o.density === "dense")
                                        .map((o) => (_jsx(SelectItem, { value: o.key, children: o.label }, o.key))) }), _jsx(FontGroup, { label: "Comfortable", children: fontOptions
                                        .filter((o) => o.density === "comfortable")
                                        .map((o) => (_jsx(SelectItem, { value: o.key, children: o.label }, o.key))) })] })] }) }), _jsx(Field, { label: "A11y", htmlFor: "theme-a11y", children: _jsxs(Select, { value: a11y, onValueChange: (v) => v && setA11y(v), children: [_jsx(SelectTrigger, { id: "theme-a11y", className: "w-[100px]", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(a11yLabels).map(([value, label]) => (_jsx(SelectItem, { value: value, children: label }, value))) })] }) }), _jsx(Field, { label: "Density", htmlFor: "theme-density", children: _jsxs(Select, { value: density, onValueChange: (v) => v && setDensity(v), children: [_jsx(SelectTrigger, { id: "theme-density", className: "w-[150px]", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(densityLabels).map(([value, label]) => (_jsx(SelectItem, { value: value, children: label }, value))) })] }) }), _jsx(Button, { variant: "outline", size: "icon", "aria-label": "Toggle light/dark", onClick: () => setTheme(current === "dark" ? "light" : "dark"), children: mounted && current === "dark" ? _jsx(Moon, {}) : _jsx(Sun, {}) })] }));
}
function Field({ label, htmlFor, children, }) {
    return (_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx(Label, { htmlFor: htmlFor, className: "text-xs text-muted-foreground", children: label }), children] }));
}
function FontGroup({ label, children, }) {
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "mt-1 px-2 pt-1 pb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase", children: label }), children] }));
}
//# sourceMappingURL=theme-switcher.js.map