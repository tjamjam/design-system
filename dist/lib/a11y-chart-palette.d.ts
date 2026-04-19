export type A11yLevel = "none" | "aa" | "aaa";
/**
 * WCAG non-text contrast thresholds. Chart fills / strokes are non-text, so
 * 3:1 is the correct bar per WCAG 2.1 SC 1.4.11. "AAA" here is an enhanced
 * 4.5:1 target, not the 7:1 text-only AAA, because forcing 5 palette colors
 * to hit 7:1 simultaneously collapses hues toward near-black.
 *
 * Inter-color distance thresholds use a perceptual-distance metric
 * (CIE76-ish, normalized 0-1) so adjacent series stay distinguishable.
 * Values chosen empirically: 0.15 is roughly "noticeably different",
 * 0.25 is "clearly different" as per Carbon's JND discussion.
 */
type A11yTarget = {
    bgRatio: number;
    pairDistance: number;
};
export declare const A11Y_TARGETS: Record<Exclude<A11yLevel, "none">, A11yTarget>;
export declare const THRESHOLDS: Record<Exclude<A11yLevel, "none">, number>;
export declare function contrastRatio(fg: string, bg: string): number;
/**
 * Perceptual distance between two colors, normalized to [0, 1].
 * CIE76 Delta E in L*a*b* space, divided by 100 so common thresholds map
 * roughly to: 0.01 = imperceptible, 0.1 = perceivable at a glance, 0.25 =
 * clearly distinguishable, 0.5 = quite different.
 */
export declare function perceptualDistance(a: string, b: string): number;
/**
 * Adjust a color's HSL lightness until it meets `target` contrast against `bg`.
 * Returns the color CLOSEST to the input that still meets target, preserving
 * hue and saturation.
 */
export declare function clampForContrast(color: string, bg: string, target: number): string;
export declare function foregroundFor(bg: string): string;
/**
 * Find the minimum pairwise perceptual distance across a palette.
 * Used as a quality metric; lower means some series are too similar.
 */
export declare function minPairDistance(colors: string[]): number;
/**
 * Second pass: after each color meets bg contrast, check pairwise distance.
 * When a pair is too close, rotate the LATER color's hue (keeping lightness
 * and saturation so bg contrast stays valid) until distance clears target
 * or we exhaust attempts. Earlier colors are anchors; later ones flex.
 *
 * This mirrors Carbon's approach of ensuring colors remain distinguishable
 * from each other, not just from the canvas.
 */
export declare function separatePalette(colors: string[], bg: string, bgTarget: number, pairTarget: number): string[];
/**
 * Produce an accessibility-adjusted palette:
 *   1. Clamp each color for bg contrast (WCAG non-text: 3:1 AA, 4.5:1 AAA)
 *   2. Hue-rotate any pairs that are perceptually too similar, preserving
 *      bg contrast. First color is an anchor; later ones flex.
 */
export declare function computeA11yPalette(chartTokens: string[], bg: string, level: A11yLevel): string[] | null;
export {};
//# sourceMappingURL=a11y-chart-palette.d.ts.map