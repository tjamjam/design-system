import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import labPlugin from "colord/plugins/lab";
import namesPlugin from "colord/plugins/names";
extend([namesPlugin, a11yPlugin, labPlugin]);
export const A11Y_TARGETS = {
    aa: { bgRatio: 3.0, pairDistance: 0.15 },
    aaa: { bgRatio: 4.5, pairDistance: 0.22 },
};
// Legacy alias for callers that only need the bg ratio number.
export const THRESHOLDS = {
    aa: A11Y_TARGETS.aa.bgRatio,
    aaa: A11Y_TARGETS.aaa.bgRatio,
};
export function contrastRatio(fg, bg) {
    try {
        return colord(fg).contrast(bg);
    }
    catch {
        return 1;
    }
}
/**
 * Perceptual distance between two colors, normalized to [0, 1].
 * CIE76 Delta E in L*a*b* space, divided by 100 so common thresholds map
 * roughly to: 0.01 = imperceptible, 0.1 = perceivable at a glance, 0.25 =
 * clearly distinguishable, 0.5 = quite different.
 */
export function perceptualDistance(a, b) {
    try {
        const la = colord(a).toLab();
        const lb = colord(b).toLab();
        const dE = Math.sqrt((la.l - lb.l) ** 2 + (la.a - lb.a) ** 2 + (la.b - lb.b) ** 2);
        return Math.min(1, dE / 100);
    }
    catch {
        return 0;
    }
}
/**
 * Adjust a color's HSL lightness until it meets `target` contrast against `bg`.
 * Returns the color CLOSEST to the input that still meets target, preserving
 * hue and saturation.
 */
export function clampForContrast(color, bg, target) {
    const src = colord(color);
    if (!src.isValid() || !colord(bg).isValid())
        return color;
    const current = contrastRatio(color, bg);
    if (current >= target)
        return color;
    const bgLum = colord(bg).luminance();
    const darken = bgLum >= 0.5;
    const { h, s } = src.toHsl();
    const startL = src.toHsl().l;
    let lo = darken ? 0 : startL;
    let hi = darken ? startL : 100;
    let bestValidL = null;
    for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        const candidate = colord({ h, s, l: mid }).toHex();
        const ratio = contrastRatio(candidate, bg);
        if (ratio >= target) {
            bestValidL = mid;
            if (darken)
                lo = mid;
            else
                hi = mid;
        }
        else {
            if (darken)
                hi = mid;
            else
                lo = mid;
        }
    }
    if (bestValidL != null) {
        return colord({ h, s, l: bestValidL }).toHex();
    }
    return darken
        ? colord({ h, s, l: 0 }).toHex()
        : colord({ h, s, l: 100 }).toHex();
}
export function foregroundFor(bg) {
    const whiteRatio = contrastRatio("#ffffff", bg);
    const blackRatio = contrastRatio("#0a0a0a", bg);
    return blackRatio > whiteRatio ? "#0a0a0a" : "#ffffff";
}
/**
 * Find the minimum pairwise perceptual distance across a palette.
 * Used as a quality metric; lower means some series are too similar.
 */
export function minPairDistance(colors) {
    let min = Infinity;
    for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            const d = perceptualDistance(colors[i], colors[j]);
            if (d < min)
                min = d;
        }
    }
    return Number.isFinite(min) ? min : 0;
}
/**
 * Shift a color's HUE by `degrees` in HSL space (close enough to OKLCH for
 * this purpose and cheap). Preserves saturation and lightness, so bg contrast
 * is preserved when the rotated color has the same lightness.
 */
function rotateHue(color, degrees) {
    const { h, s, l } = colord(color).toHsl();
    const next = (((h + degrees) % 360) + 360) % 360;
    return colord({ h: next, s, l }).toHex();
}
/**
 * Second pass: after each color meets bg contrast, check pairwise distance.
 * When a pair is too close, rotate the LATER color's hue (keeping lightness
 * and saturation so bg contrast stays valid) until distance clears target
 * or we exhaust attempts. Earlier colors are anchors; later ones flex.
 *
 * This mirrors Carbon's approach of ensuring colors remain distinguishable
 * from each other, not just from the canvas.
 */
export function separatePalette(colors, bg, bgTarget, pairTarget) {
    const out = colors.slice();
    for (let i = 1; i < out.length; i++) {
        for (let j = 0; j < i; j++) {
            if (perceptualDistance(out[i], out[j]) >= pairTarget)
                continue;
            // Try hue rotations in alternating directions at increasing magnitudes.
            const attempts = [15, -15, 30, -30, 45, -45, 60, -60, 90, -90, 120, -120];
            let best = out[i];
            let bestDistance = perceptualDistance(out[i], out[j]);
            for (const deg of attempts) {
                const candidate = rotateHue(out[i], deg);
                // Require bg contrast to survive the rotation.
                if (contrastRatio(candidate, bg) < bgTarget)
                    continue;
                // Require no regression against OTHER already-placed colors.
                const regressesOther = out
                    .slice(0, i)
                    .filter((_, idx) => idx !== j)
                    .some((k) => perceptualDistance(candidate, k) < pairTarget * 0.8);
                if (regressesOther)
                    continue;
                const d = perceptualDistance(candidate, out[j]);
                if (d > bestDistance) {
                    best = candidate;
                    bestDistance = d;
                    if (d >= pairTarget)
                        break;
                }
            }
            out[i] = best;
        }
    }
    // Final bg-contrast sanity pass (should be no-op; rotations preserve L).
    return out.map((c) => contrastRatio(c, bg) >= bgTarget ? c : clampForContrast(c, bg, bgTarget));
}
/**
 * Produce an accessibility-adjusted palette:
 *   1. Clamp each color for bg contrast (WCAG non-text: 3:1 AA, 4.5:1 AAA)
 *   2. Hue-rotate any pairs that are perceptually too similar, preserving
 *      bg contrast. First color is an anchor; later ones flex.
 */
export function computeA11yPalette(chartTokens, bg, level) {
    if (level === "none")
        return null;
    const { bgRatio, pairDistance } = A11Y_TARGETS[level];
    const clamped = chartTokens.map((token) => {
        if (!token)
            return token;
        return clampForContrast(token, bg, bgRatio);
    });
    return separatePalette(clamped, bg, bgRatio, pairDistance);
}
//# sourceMappingURL=a11y-chart-palette.js.map