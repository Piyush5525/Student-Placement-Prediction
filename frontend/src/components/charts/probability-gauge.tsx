import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { DURATION, EASE } from "@/lib/motion";

export type GaugeSize = "sm" | "md" | "lg";

const SIZE_PX: Record<GaugeSize, number> = { sm: 72, md: 120, lg: 200 };
const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function semanticColor(value: number): { stroke: string; label: string; className: string } {
  if (value >= 75) return { stroke: "#2FD584", label: "STRONG", className: "text-success" };
  if (value >= 45) return { stroke: "#F5B14C", label: "MODERATE", className: "text-warning" };
  return { stroke: "#F5647C", label: "AT RISK", className: "text-danger" };
}

interface ProbabilityGaugeProps {
  /** 0–100 committed value. */
  value: number;
  /** Optional 0–100 projected value — rendered as a dashed ghost arc overlay (What-If Simulator). */
  projectedValue?: number;
  size?: GaugeSize;
  /** Overrides the auto-derived semantic label (e.g. "ATS SCORE" reuse). */
  label?: string;
  suffix?: string;
  className?: string;
  /**
   * "semantic" (default) colors the fill green/amber/red by value — for
   * judgment scores (probability, ATS). "neutral" always uses accent-solid
   * — for plain progress metrics like profile completeness, where a low
   * value isn't "bad," just "not done yet."
   */
  tone?: "semantic" | "neutral";
}

/**
 * Circular probability gauge — DESIGN_SYSTEM §07 "Probability Gauge"
 * verbatim spec: track line-soft 10px round-cap, fill 10px round-cap
 * semantic-solid, −90° start clockwise sweep, font-display numeral center,
 * font-mono uppercase qualitative label beneath. Reused verbatim (same
 * component, relabeled) for Placement Probability and any other 0–100 AI
 * score — never a new gauge style per §07's explicit reuse rule.
 */
export function ProbabilityGauge({
  value,
  projectedValue,
  size = "md",
  label,
  suffix = "%",
  className,
  tone = "semantic",
}: ProbabilityGaugeProps) {
  const reducedMotion = usePrefersReducedMotion();
  const diameter = SIZE_PX[size];
  const derived = semanticColor(value);
  const { stroke, label: qualLabel, className: semanticClassName } =
    tone === "neutral" ? { stroke: "#7C6CFF", label: "COMPLETE", className: "text-accent-ink" } : derived;
  const motionValue = useMotionValue(0);
  const roundedValue = useTransform(motionValue, (v) => `${Math.round(v)}`);
  const dashOffset = useTransform(motionValue, (v) => CIRCUMFERENCE - (v / 100) * CIRCUMFERENCE);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: hasAnimated.current ? DURATION.recompute : DURATION.recompute * 1.1,
      ease: EASE.expoOut,
    });
    hasAnimated.current = true;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reducedMotion]);

  const projectedOffset =
    projectedValue !== undefined ? CIRCUMFERENCE - (projectedValue / 100) * CIRCUMFERENCE : undefined;

  const numeralSize = Math.round(diameter * 0.2);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: diameter, height: diameter }}>
      <svg width={diameter} height={diameter} viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--border-subtle-rgba)" strokeWidth="10" />
        {projectedOffset !== undefined && (
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="#7C6CFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={projectedOffset}
            strokeOpacity={0.55}
            style={{ strokeDasharray: "4 5" }}
          />
        )}
        <motion.circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-text-primary tabular-nums" style={{ fontSize: numeralSize }}>
          <motion.span>{roundedValue}</motion.span>
          <span style={{ fontSize: numeralSize * 0.55 }}>{suffix}</span>
        </span>
        {size !== "sm" && (
          <span
            className={cn("font-mono uppercase tracking-wider", semanticClassName)}
            style={{ fontSize: Math.max(9, diameter * 0.07) }}
          >
            {label ?? qualLabel}
          </span>
        )}
      </div>
    </div>
  );
}
