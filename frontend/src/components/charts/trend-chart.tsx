import {
  Area,
  Line,
  ComposedChart,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Dot,
} from "recharts";
import { cn } from "@/lib/cn";

interface TrendChartProps<T extends object> {
  data: T[];
  xKey: Extract<keyof T, string>;
  /** Primary series gets the gradient area fill; any additional series render as thin lines only. */
  series: { dataKey: Extract<keyof T, string>; color: string; label?: string }[];
  height?: number;
  className?: string;
}

const CHART_COLORS = ["#7C6CFF", "#22D3EE", "#F5B14C", "#5BA8FF"];

/**
 * Trend chart — DESIGN_SYSTEM §07 verbatim spec: max 3 horizontal
 * gridlines only (never a full grid), 2.5px primary line with a
 * top-to-bottom gradient area fill (35%→0% opacity), an always-visible
 * emphasized endpoint dot, dashed accent hover guide-line via Recharts'
 * built-in cursor. Secondary series render thinner (2px), no area fill.
 */
export function TrendChart<T extends object>({
  data,
  xKey,
  series,
  height = 260,
  className,
}: TrendChartProps<T>) {
  const primary = series[0];
  const rest = series.slice(1);
  const lastIndex = data.length - 1;

  return (
    <div className={cn("h-full w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`trend-fill-${primary.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primary.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={primary.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal vertical={false} stroke="var(--border-subtle-rgba)" strokeDasharray="0" />
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B6E7E", fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
          <Tooltip
            cursor={{ stroke: "#7C6CFF", strokeDasharray: "3 3", strokeWidth: 1 }}
            contentStyle={{
              background: "rgb(var(--bg-elevated))",
              border: "1px solid var(--border-subtle-rgba)",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-body)",
            }}
            labelStyle={{ color: "#A0A3B1" }}
          />
          <Area
            type="monotone"
            dataKey={primary.dataKey}
            stroke={primary.color}
            strokeWidth={2.5}
            fill={`url(#trend-fill-${primary.dataKey})`}
            activeDot={{ r: 4.5, fill: primary.color, stroke: "rgb(var(--bg-elevated))", strokeWidth: 2 }}
            dot={(props: { index?: number; cx?: number; cy?: number; key?: string }) => {
              const { index, cx, cy, key } = props;
              // Always-visible endpoint dot — §07 "Endpoint" spec — every
              // other point stays undotted so the line itself stays clean.
              if (index !== lastIndex || cx === undefined || cy === undefined) {
                return <Dot key={key ?? `pt-${index}`} cx={cx} cy={cy} r={0} fill="none" stroke="none" />;
              }
              return (
                <Dot
                  key={key ?? "endpoint"}
                  cx={cx}
                  cy={cy}
                  r={4.5}
                  fill={primary.color}
                  stroke="rgb(var(--bg-elevated))"
                  strokeWidth={2}
                />
              );
            }}
          />
          {rest.map((s, i) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              stroke={s.color ?? CHART_COLORS[(i + 1) % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
