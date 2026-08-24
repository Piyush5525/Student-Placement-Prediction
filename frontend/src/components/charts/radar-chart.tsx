import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/cn";

interface RadarSeries<T> {
  dataKey: Extract<keyof T, string>;
  color: string;
  /** Dashed, unfilled overlay — DESIGN_SYSTEM §07 "Comparison polygon" (Target company / benchmark mode). */
  isComparison?: boolean;
}

interface RadarChartProps<T extends object> {
  data: T[];
  axisKey: Extract<keyof T, string>;
  series: RadarSeries<T>[];
  height?: number;
  className?: string;
}

/**
 * Radar chart — DESIGN_SYSTEM §07 verbatim spec: concentric-ring grid,
 * spokes, primary series as accent-solid stroke + accent-soft fill,
 * optional comparison series as a dashed unfilled overlay. Used for the
 * Skill-Gap radar and the Skill Radar module on the dashboard.
 */
export function RadarChart<T extends object>({
  data,
  axisKey,
  series,
  height = 320,
  className,
}: RadarChartProps<T>) {
  return (
    <div className={cn("h-full w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--border-subtle-rgba)" />
          <PolarAngleAxis
            dataKey={axisKey}
            tick={{ fill: "#8A8FA0", fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
          {series.map((s) =>
            s.isComparison ? (
              <Radar
                key={s.dataKey}
                dataKey={s.dataKey}
                stroke={s.color}
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            ) : (
              <Radar
                key={s.dataKey}
                dataKey={s.dataKey}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.22}
                strokeWidth={2}
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              />
            ),
          )}
          <Tooltip
            contentStyle={{
              background: "rgb(var(--bg-elevated))",
              border: "1px solid var(--border-subtle-rgba)",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-body)",
            }}
            labelStyle={{ color: "#F5F6FA" }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
