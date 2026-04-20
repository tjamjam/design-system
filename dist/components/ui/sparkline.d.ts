type SparklineProps = {
    data: number[];
    color?: string;
    height?: number;
    gradient?: boolean;
    className?: string;
    /**
     * Pointer-only callback that fires as the cursor moves over the chart.
     * Receives the closest data index, or `null` when the pointer leaves.
     * Not triggered by keyboard input or by taps on touch devices; pointermove
     * fires continuously during a drag, but a tap produces no move event.
     */
    onHoverIndex?: (index: number | null) => void;
};
export declare function Sparkline({ data, color, height, gradient, className, onHoverIndex, }: SparklineProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=sparkline.d.ts.map