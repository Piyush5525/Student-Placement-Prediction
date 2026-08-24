import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  className?: string;
  onClick?: () => void;
}

const TREND_CLASS: Record<"up" | "down" | "flat", string> = {
  up: "text-success",
  down: "text-danger",
  flat: "text-text-muted",
};

const TREND_GLYPH: Record<"up" | "down" | "flat", string> = { up: "↑", down: "↓", flat: "—" };

/**
 * StatCard — FRONTEND_ARCHITECTURE §7 "Consistent card anatomy": icon/label
 * top, primary metric large and left-aligned, trend/secondary context
 * bottom. Repeated across Dashboard/Analytics so it's pattern-matched
 * instantly regardless of page.
 */
export function StatCard({ icon, label, value, trend, className, onClick }: StatCardProps) {
  return (
    <Card interactive={!!onClick} onClick={onClick} padding="default" className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2 text-text-secondary">
        {icon && <span className="[&_svg]:size-4">{icon}</span>}
        <span className="font-mono text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold text-text-primary tabular-nums">{value}</div>
      {trend && (
        <div className={cn("flex items-center gap-1 text-xs font-medium", TREND_CLASS[trend.direction])}>
          <span>{TREND_GLYPH[trend.direction]}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </Card>
  );
}
