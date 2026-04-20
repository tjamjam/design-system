/**
 * Maps a pointer x-coordinate to the nearest data index in a sparkline.
 * Returns null when the data set is empty or the wrapper has no measured
 * width (e.g. before layout).
 *
 * Assumes the chart's left/right plot margins are 0 so the data spans the
 * full wrapper width. If the Sparkline's AreaChart margins change, this
 * math will need to account for them.
 */
export declare function computeHoverIndex(clientX: number, rect: {
    left: number;
    width: number;
}, dataLength: number): number | null;
//# sourceMappingURL=sparkline-utils.d.ts.map