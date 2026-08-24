import { Bar, BarChart, Cell, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/cn";

interface ComparisonBarChartProps {
  data: { label: string; value: number; isOwn?: boolean }[];
  height?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

/**
 * Comparison bar chart — DESIGN_SYSTEM §07 verbatim spec: the student's
 * own bar is the only gradient-filled element in the chart; every
 * comparison bar (branch/tier/platform average) is flat `--line` fill.
 */
export function ComparisonBarChart({
  data,
  height = 220,
  formatValue = (v) => `₹${v.toFixed(1)}L`,
  className,
}: ComparisonBarChartProps) {
  return (
    <div className={cn("h-full w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="own-bar-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6E5BFF" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8A8FA0", fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            formatter={(value: number) => formatValue(value)}
            contentStyle={{
              background: "rgb(var(--bg-elevated))",
              border: "1px solid var(--border-subtle-rgba)",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-body)",
            }}
            labelStyle={{ color: "#A0A3B1" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: "top", formatter: formatValue, fill: "#F5F6FA", fontSize: 12, fontFamily: "var(--font-mono)" }}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.isOwn ? "url(#own-bar-fill)" : "var(--border-strong-rgba)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
