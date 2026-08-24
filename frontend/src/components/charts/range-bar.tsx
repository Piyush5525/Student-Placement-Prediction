import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/lib/motion";

interface RangeBarProps {
  min: number;
  max: number;
  /** The emphasized point-estimate within [min, max] — usually the midpoint. */
  midpoint: number;
  /** Absolute scale bounds the track represents (defaults to a comfortable padding around min/max). */
  scaleMin?: number;
  scaleMax?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

/**
 * Salary range band — DESIGN_SYSTEM §07 verbatim spec: full track in
 * line-soft, gradient fill ONLY within the predicted range (never the
 * full track), midpoint marker is a filled ring (not a plain dot) to read
 * as "the estimate" distinct from "the range."
 */
export function RangeBar({
  min,
  max,
  midpoint,
  scaleMin,
  scaleMax,
  formatValue = (v) => `₹${v.toFixed(1)}L`,
  className,
}: RangeBarProps) {
  const lo = scaleMin ?? Math.max(0, min - (max - min) * 0.6);
  const hi = scaleMax ?? max + (max - min) * 0.6;
  const span = hi - lo || 1;

  const startPct = ((min - lo) / span) * 100;
  const widthPct = ((max - min) / span) * 100;
  const midPct = ((midpoint - lo) / span) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-2.5 w-full rounded-full bg-bg-elevated-2">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DURATION.recompute, ease: EASE.expoOut }}
          style={{
            position: "absolute",
            left: `${startPct}%`,
            width: `${widthPct}%`,
            transformOrigin: "left",
          }}
          className="h-full rounded-full bg-gradient-to-r from-accent-from to-accent-to"
        />
        <motion.div
          initial={{ opacity: 0, left: `${startPct}%` }}
          animate={{ opacity: 1, left: `${midPct}%` }}
          transition={{ duration: DURATION.recompute, ease: EASE.expoOut }}
          style={{ position: "absolute", top: "50%" }}
          className="size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-accent-solid bg-bg-elevated"
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs text-text-muted">
        <span>{formatValue(min)}</span>
        <span className="font-semibold text-accent-ink">{formatValue(midpoint)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
