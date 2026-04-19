"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis, } from "recharts";
export function Sparkline({ data, color = "var(--chart-1)", height = 32, gradient = true, className, }) {
    const id = React.useId().replace(/:/g, "_");
    const gradientId = `sparkline-${id}`;
    const series = React.useMemo(() => data.map((value, index) => ({ index, value })), [data]);
    return (_jsx("div", { "data-slot": "sparkline", className: className, style: { width: "100%", height }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: series, margin: { top: 2, right: 0, left: 0, bottom: 0 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: color, stopOpacity: gradient ? 0.35 : 0 }), _jsx("stop", { offset: "100%", stopColor: color, stopOpacity: 0 })] }) }), _jsx(YAxis, { hide: true, domain: ["dataMin", "dataMax"] }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: color, strokeWidth: 1.5, fill: `url(#${gradientId})`, isAnimationActive: false })] }) }) }));
}
//# sourceMappingURL=sparkline.js.map