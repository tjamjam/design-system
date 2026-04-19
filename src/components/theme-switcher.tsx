"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  A11yLevel,
  Brand,
  Density,
  useBrand,
} from "@/components/theme-provider";
import { companies, type CompanyKey } from "@/lib/companies";
import { fontOptions, type FontSlot } from "@/lib/font-options";

const brandLabels: Record<Brand, string> = {
  ibm: "IBM",
  vercel: "Vercel",
  linear: "Linear",
};

const densityLabels: Record<Density, string> = {
  compact: "Compact",
  default: "Default",
  comfortable: "Comfortable",
};

const a11yLabels: Record<A11yLevel, string> = {
  none: "None",
  aa: "AA",
  aaa: "AAA",
};

export function ThemeSwitcher() {
  const {
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
  } = useBrand();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Standard next-themes pattern: mounted flag prevents hydration mismatch
  // on the light/dark toggle icon. setState-in-effect is the documented approach.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);

  const current = mounted ? (resolvedTheme ?? theme ?? "light") : "light";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Brand" htmlFor="theme-brand">
        <Select value={brand} onValueChange={(v) => v && setBrand(v as Brand)}>
          <SelectTrigger id="theme-brand" className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(brandLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Company" htmlFor="theme-company">
        <Select
          value={company}
          onValueChange={(v) => v && setCompany(v as CompanyKey)}
        >
          <SelectTrigger id="theme-company" className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.key} value={c.key}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Font" htmlFor="theme-font">
        <Select
          value={font}
          onValueChange={(v) => v && setFont(v as FontSlot)}
        >
          <SelectTrigger id="theme-font" className="w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[380px]">
            <SelectItem value="default">Theme default</SelectItem>
            <FontGroup label="Dense B2B">
              {fontOptions
                .filter((o) => o.density === "dense")
                .map((o) => (
                  <SelectItem key={o.key} value={o.key}>
                    {o.label}
                  </SelectItem>
                ))}
            </FontGroup>
            <FontGroup label="Comfortable">
              {fontOptions
                .filter((o) => o.density === "comfortable")
                .map((o) => (
                  <SelectItem key={o.key} value={o.key}>
                    {o.label}
                  </SelectItem>
                ))}
            </FontGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field label="A11y" htmlFor="theme-a11y">
        <Select
          value={a11y}
          onValueChange={(v) => v && setA11y(v as A11yLevel)}
        >
          <SelectTrigger id="theme-a11y" className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(a11yLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Density" htmlFor="theme-density">
        <Select
          value={density}
          onValueChange={(v) => v && setDensity(v as Density)}
        >
          <SelectTrigger id="theme-density" className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(densityLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle light/dark"
        onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      >
        {mounted && current === "dark" ? <Moon /> : <Sun />}
      </Button>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function FontGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mt-1 px-2 pt-1 pb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      {children}
    </>
  );
}
