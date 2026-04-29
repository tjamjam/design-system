"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";

import { cn } from "../../lib/utils";
import { computeHoverIndex } from "../../lib/sparkline-utils";

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

export function Sparkline({
  data,
  color = "var(--chart-1)",
  height = 32,
  gradient = true,
  className,
  onHoverIndex,
}: SparklineProps) {
  const id = React.useId().replace(/:/g, "_");
  const gradientId = `sparkline-${id}`;
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const series = React.useMemo(
    () => data.map((value, index) => ({ index, value })),
    [data],
  );

  function handleMove(clientX: number) {
    if (!onHoverIndex) return;
    const el = wrapperRef.current;
    if (!el) return;
    const idx = computeHoverIndex(
      clientX,
      el.getBoundingClientRect(),
      data.length,
    );
    if (idx !== null) onHoverIndex(idx);
  }

  return (
    <div
      ref={wrapperRef}
      data-slot="sparkline"
      className={cn("[&_*]:outline-none", className)}
      style={{ width: "100%", height, touchAction: "none" }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        handleMove(e.clientX);
      }}
      onPointerMove={(e) => handleMove(e.clientX)}
      onPointerUp={() => onHoverIndex?.(null)}
      onPointerCancel={() => onHoverIndex?.(null)}
      onPointerLeave={() => onHoverIndex?.(null)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={series}
          margin={{ top: 6, right: 0, left: 0, bottom: 6 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={color}
                stopOpacity={gradient ? 0.35 : 0}
              />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
