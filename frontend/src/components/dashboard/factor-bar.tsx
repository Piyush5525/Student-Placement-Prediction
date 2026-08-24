import { motion } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/lib/motion";

interface FactorBarProps {
  label: string;
  /** Signed percentage-point contribution. */
  impact: number;
  explanation?: string;
  /** Largest absolute impact across the set — scales this bar relative to it. */
  maxAbsImpact: number;
}

/**
 * Factor contribution bar — DESIGN_SYSTEM §08 "FactorBar": horizontal
 * diverging bar from a center zero-line, positive extends right in
 * success color, negative extends left in danger color, label outside the
 * bar. Hoverable for a plain-language explanation.
 */
export function FactorBar({ label, impact, explanation, maxAbsImpact }: FactorBarProps) {
  const isPositive = impact >= 0;
  const widthPct = maxAbsImpact === 0 ? 0 : (Math.abs(impact) / maxAbsImpact) * 100;

  const bar = (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 truncate text-sm text-text-secondary">{label}</span>
      <div className="relative h-2 flex-1 rounded-full bg-bg-elevated-2">
        <div className="absolute inset-y-0 left-1/2 w-px bg-border-strong" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${widthPct / 2}%` }}
          transition={{ duration: DURATION.recompute, ease: EASE.expoOut }}
          className={cn(
            "absolute inset-y-0 rounded-full",
            isPositive ? "left-1/2 bg-success" : "right-1/2 bg-danger",
          )}
        />
      </div>
      <span className={cn("w-12 shrink-0 text-right font-mono text-xs tabular-nums", isPositive ? "text-success" : impact < 0 ? "text-danger" : "text-text-muted")}>
        {impact > 0 ? "+" : ""}
        {impact}
      </span>
    </div>
  );

  if (!explanation) return bar;
  return <Tooltip content={explanation}>{bar}</Tooltip>;
}
