/**
 * Maps a pointer x-coordinate to the nearest data index in a sparkline.
 * Returns null when the data set is empty or the wrapper has no measured
 * width (e.g. before layout).
 *
 * Assumes the chart's left/right plot margins are 0 so the data spans the
 * full wrapper width. If the Sparkline's AreaChart margins change, this
 * math will need to account for them.
 */
export function computeHoverIndex(clientX, rect, dataLength) {
    if (dataLength === 0)
        return null;
    if (rect.width <= 0)
        return null;
    const ratio = (clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (dataLength - 1));
    return Math.max(0, Math.min(dataLength - 1, idx));
}
//# sourceMappingURL=sparkline-utils.js.map