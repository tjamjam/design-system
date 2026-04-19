export type FontSlot = "default" | FontKey;
export type FontKey = "inter" | "ibm-plex-sans" | "geist" | "lexend" | "public-sans" | "dm-sans" | "plus-jakarta-sans" | "manrope" | "outfit" | "figtree";
export type FontOption = {
    key: FontKey;
    label: string;
    density: "dense" | "comfortable";
    note: string;
};
export declare const fontOptions: FontOption[];
//# sourceMappingURL=font-options.d.ts.map