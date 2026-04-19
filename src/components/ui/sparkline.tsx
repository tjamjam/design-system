"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";

type SparklineProps = {
  data: number[];
  color?: string;
  height?: number;
  gradient?: boolean;
  className?: string;
};

export function Sparkline({
  data,
  color = "var(--chart-1)",
  height = 32,
  gradient = true,
  className,
}: SparklineProps) {
  const id = React.useId().replace(/:/g, "_");
  const gradientId = `sparkline-${id}`;

  const series = React.useMemo(
    () => data.map((value, index) => ({ index, value })),
    [data],
  );

  return (
    <div
      data-slot="sparkline"
      className={className}
      style={{ width: "100%", height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={series}
          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={gradient ? 0.35 : 0} />
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
