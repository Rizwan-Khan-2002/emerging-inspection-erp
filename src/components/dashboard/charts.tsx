"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inspectionsByType, revenueSeries } from "@/lib/mock-data";

const NAVY = "#102437";
const BORDER = "#1c3650";
const ACCENT = "#ff7a00";
const INFO = "#3aa0ff";
const STEEL = "#6b7c8d";

const tooltipStyle = {
  background: "#0a2033",
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
};

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={revenueSeries} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.5} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={INFO} stopOpacity={0.35} />
            <stop offset="100%" stopColor={INFO} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
        <XAxis dataKey="month" stroke={STEEL} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke={STEEL} fontSize={11} tickLine={false} axisLine={false}
          tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${Number(v).toLocaleString()} SAR`} />
        <Area type="monotone" dataKey="revenue" stroke={ACCENT} strokeWidth={2} fill="url(#rev)" name="Revenue" />
        <Area type="monotone" dataKey="expense" stroke={INFO} strokeWidth={2} fill="url(#exp)" name="Expense" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function InspectionTypeChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={inspectionsByType} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
        <XAxis dataKey="type" stroke={STEEL} fontSize={11} tickLine={false} axisLine={false}
          interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis stroke={STEEL} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: NAVY }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Inspections">
          {inspectionsByType.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? ACCENT : INFO} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
