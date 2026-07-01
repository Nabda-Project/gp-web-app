"use client";

import { useMemo, useRef, useState } from "react";
import type { DailySummary, HourlySummary } from "@/types/models";

type Point = {
  label: string;
  hr?: number | null;
  spo2?: number | null;
};

export function VitalChart({
  data,
  mode
}: {
  data: Array<DailySummary | HourlySummary>;
  mode: "hr" | "spo2" | "both";
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points: Point[] = useMemo(
    () =>
      data.map((item) => ({
        label: "dateTime" in item ? item.dateTime.slice(11, 16) : item.date.slice(5),
        hr: item.avgHeartRate,
        spo2: item.avgSpo2
      })),
    [data]
  );

  const values = points
    .flatMap((point) => [point.hr, point.spo2])
    .filter((value): value is number => typeof value === "number");

  if (!points.length || !values.length) {
    return <div className="grid h-72 place-items-center text-sm font-semibold text-grey">No vitals data available for this patient</div>;
  }

  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const width = 760;
  const height = 300;
  const pad = 36;
  const x = (index: number) => pad + (index * (width - pad * 2)) / Math.max(1, points.length - 1);
  const y = (value: number) => height - pad - ((value - min) * (height - pad * 2)) / Math.max(1, max - min);
  const line = (key: "hr" | "spo2") =>
    points
      .map((point, index) => {
        const value = point[key];
        return typeof value === "number" ? `${index === 0 ? "M" : "L"} ${x(index)} ${y(value)}` : "";
      })
      .filter(Boolean)
      .join(" ");

  function pickIndex(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * width;
    if (svgX < pad || svgX > width - pad) return null;
    const step = (width - pad * 2) / Math.max(1, points.length - 1);
    const index = Math.round((svgX - pad) / step);
    return Math.max(0, Math.min(points.length - 1, index));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const hoverX = hoverIndex !== null ? x(hoverIndex) : 0;

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-72 w-full"
        onMouseMove={(event) => setHoverIndex(pickIndex(event.clientX))}
        onMouseLeave={() => setHoverIndex(null)}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (touch) setHoverIndex(pickIndex(touch.clientX));
        }}
        onTouchEnd={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="chartBg" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#FDFDFF" />
            <stop offset="1" stopColor="#F5F7FC" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} rx="20" fill="url(#chartBg)" />
        {[0, 1, 2, 3].map((tick) => (
          <line key={tick} x1={pad} x2={width - pad} y1={pad + tick * 64} y2={pad + tick * 64} stroke="#E2E8F0" strokeOpacity="0.6" />
        ))}
        {(mode === "hr" || mode === "both") && <path d={line("hr")} fill="none" stroke="#FF5252" strokeWidth="3" strokeLinecap="round" />}
        {(mode === "spo2" || mode === "both") && <path d={line("spo2")} fill="none" stroke="#2196F3" strokeWidth="3" strokeLinecap="round" />}
        {points.map((point, index) => (
          <text key={point.label + index} x={x(index)} y={height - 10} textAnchor="middle" fontSize="10" fill="#94A3B8">
            {point.label}
          </text>
        ))}
        {hovered ? (
          <g pointerEvents="none">
            <line x1={hoverX} x2={hoverX} y1={pad} y2={height - pad} stroke="#94A3B8" strokeDasharray="4 4" strokeOpacity="0.6" />
            {(mode === "hr" || mode === "both") && typeof hovered.hr === "number" ? (
              <circle cx={hoverX} cy={y(hovered.hr)} r="5" fill="#FF5252" stroke="#fff" strokeWidth="2" />
            ) : null}
            {(mode === "spo2" || mode === "both") && typeof hovered.spo2 === "number" ? (
              <circle cx={hoverX} cy={y(hovered.spo2)} r="5" fill="#2196F3" stroke="#fff" strokeWidth="2" />
            ) : null}
          </g>
        ) : null}
      </svg>
      {hovered ? (
        <div
          className="pointer-events-none absolute top-3 rounded-xl bg-darkBlue px-3 py-2 text-xs font-semibold text-white shadow-lg"
          style={{ left: `calc(${(hoverX / width) * 100}% + 8px)`, transform: hoverX / width > 0.7 ? "translateX(-100%)" : undefined }}
        >
          <div className="mb-1 text-white/70">{hovered.label}</div>
          {(mode === "hr" || mode === "both") && typeof hovered.hr === "number" ? (
            <div>
              <span className="text-[#FF9E9E]">HR</span> {Math.round(hovered.hr)} BPM
            </div>
          ) : null}
          {(mode === "spo2" || mode === "both") && typeof hovered.spo2 === "number" ? (
            <div>
              <span className="text-[#9EC8FF]">SpO2</span> {Math.round(hovered.spo2)}%
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
