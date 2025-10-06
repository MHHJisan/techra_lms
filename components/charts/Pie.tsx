"use client";

import * as React from "react";

export type PieDatum = { label: string; value: number; color?: string };

const DEFAULT_COLORS = [
  "#0ea5e9", // sky-500
  "#22c55e", // green-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#14b8a6", // teal-500
  "#e11d48", // rose-600
  "#84cc16", // lime-500
];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
}

export function Pie({
  data,
  size = 180,
  radius = 80,
  donut = false,
  className,
}: {
  data: PieDatum[];
  size?: number;
  radius?: number;
  donut?: boolean;
  className?: string;
}) {
  const total = Math.max(
    0,
    data.reduce((acc, d) => acc + (isFinite(d.value) ? Math.max(0, d.value) : 0), 0)
  );
  const cx = size / 2;
  const cy = size / 2;

  let currentAngle = 0;
  const segments = (total > 0 ? data : []).map((d, i) => {
    const pct = d.value / total;
    const sweep = pct * 360;
    const start = currentAngle;
    const end = currentAngle + sweep;
    currentAngle = end;
    const color = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
    return { ...d, color, start, end, pct };
  });

  return (
    <div className={className}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto block">
        {/* Empty state ring */}
        {total === 0 && (
          <circle cx={cx} cy={cy} r={radius} fill="#e5e7eb" />
        )}
        {segments.map((s, idx) => (
          <path key={idx} d={arcPath(cx, cy, radius, s.start, s.end)} fill={s.color} />
        ))}
        {donut && (
          <circle cx={cx} cy={cy} r={radius * 0.55} fill="#fff" />
        )}
      </svg>
      {/* Legend */}
      <div className="mt-3 space-y-1">
        {data.map((d, i) => {
          const color = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={d.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{ background: color }} />
                <span className="text-slate-700">{d.label}</span>
              </div>
              <div className="text-slate-500 tabular-nums">{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
