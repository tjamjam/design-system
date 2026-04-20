import { describe, it, expect } from "vitest";
import { computeHoverIndex } from "./sparkline-utils";

const RECT = { left: 0, width: 100 };

describe("computeHoverIndex", () => {
  it("returns null when the data set is empty", () => {
    expect(computeHoverIndex(50, RECT, 0)).toBeNull();
  });

  it("returns null when the wrapper has no measured width", () => {
    expect(computeHoverIndex(50, { left: 0, width: 0 }, 10)).toBeNull();
  });

  it("returns 0 at the left edge", () => {
    expect(computeHoverIndex(0, RECT, 10)).toBe(0);
  });

  it("returns the last index at the right edge", () => {
    expect(computeHoverIndex(100, RECT, 10)).toBe(9);
  });

  it("returns the middle index for a centered cursor", () => {
    expect(computeHoverIndex(50, RECT, 11)).toBe(5);
  });

  it("clamps to 0 when the pointer is left of the wrapper", () => {
    expect(computeHoverIndex(-20, RECT, 10)).toBe(0);
  });

  it("clamps to the last index when the pointer is right of the wrapper", () => {
    expect(computeHoverIndex(200, RECT, 10)).toBe(9);
  });

  it("accounts for a non-zero rect.left offset", () => {
    const rect = { left: 50, width: 100 };
    expect(computeHoverIndex(50, rect, 10)).toBe(0);
    expect(computeHoverIndex(150, rect, 10)).toBe(9);
    expect(computeHoverIndex(100, rect, 11)).toBe(5);
  });

  it("always returns 0 when data has a single point", () => {
    expect(computeHoverIndex(0, RECT, 1)).toBe(0);
    expect(computeHoverIndex(50, RECT, 1)).toBe(0);
    expect(computeHoverIndex(100, RECT, 1)).toBe(0);
  });

  it("rounds to the nearest index rather than flooring", () => {
    // 11 points span 100px → 10px per interval, so 74/100 → index 7
    expect(computeHoverIndex(74, RECT, 11)).toBe(7);
    // 76/100 → index 8
    expect(computeHoverIndex(76, RECT, 11)).toBe(8);
  });
});
