import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/lib/motion";

interface SkillBarProps {
  label: string;
  current: number;
  target?: number;
  max?: number;
  className?: string;
}

/**
 * SkillBar — DESIGN_SYSTEM §04 core component: horizontal proficiency bar
 * with a target-vs-current marker. Track line-soft, fill accent-solid to
 * current value, target shown as a 2px vertical tick at the target value.
 */
export function SkillBar({ label, current, target, max = 100, className }: SkillBarProps) {
  const currentPct = Math.min(100, (current / max) * 100);
  const targetPct = target !== undefined ? Math.min(100, (target / max) * 100) : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono text-xs tabular-nums text-text-muted">
          {current}
          {target !== undefined && <span className="text-text-muted"> / {target}</span>}
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-bg-elevated-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${currentPct}%` }}
          transition={{ duration: DURATION.recompute, ease: EASE.expoOut }}
          className="h-full rounded-full bg-accent-solid"
        />
        {targetPct !== undefined && (
          <div
            className="absolute inset-y-0 w-0.5 bg-text-secondary"
            style={{ left: `${targetPct}%` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
