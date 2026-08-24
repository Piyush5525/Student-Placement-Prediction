import { Bar, Line, ComposedChart, XAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/cn";

interface ComboChartProps<T extends object> {
  data: T[];
  xKey: Extract<keyof T, string>;
  barKey: { dataKey: Extract<keyof T, string>; color: string; label: string };
  lineKey: { dataKey: Extract<keyof T, string>; color: string; label: string };
  height?: number;
  className?: string;
}

/** Bar+line combo — habits-vs-outcomes framing (study/sleep hours), FRONTEND_ARCHITECTURE §6.12. */
export function ComboChart<T extends object>({
  data,
  xKey,
  barKey,
  lineKey,
  height = 220,
  className,
}: ComboChartProps<T>) {
  return (
    <div className={cn("h-full w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B6E7E", fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
          <Tooltip
            contentStyle={{
              background: "rgb(var(--bg-elevated))",
              border: "1px solid var(--border-subtle-rgba)",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-body)",
            }}
            labelStyle={{ color: "#A0A3B1" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            formatter={(value) => <span style={{ color: "#A0A3B1" }}>{value}</span>}
          />
          <Bar dataKey={barKey.dataKey} name={barKey.label} fill={barKey.color} radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.55} />
          <Line
            type="monotone"
            dataKey={lineKey.dataKey}
            name={lineKey.label}
            stroke={lineKey.color}
            strokeWidth={2}
            dot={{ r: 3, fill: lineKey.color, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
