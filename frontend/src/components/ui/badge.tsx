import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type SemanticTone = "success" | "warning" | "danger" | "info" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: SemanticTone;
}

const toneClasses: Record<SemanticTone, string> = {
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-danger/12 text-danger",
  info: "bg-info/12 text-info",
  accent: "bg-accent-soft text-accent-ink",
};

/**
 * Semantic pill — PriorityBadge / status Badge (DESIGN_SYSTEM §08).
 * 12%-opacity tone background + full-strength tone text, no border.
 * Reserved for severity/priority/status meaning (High impact, Mastered,
 * Strong chance) — never for neutral categorical labels, which use <Chip>
 * instead so the two meanings are never visually confused.
 */
export function Badge({ tone = "accent", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

/**
 * Neutral tag/chip — branch, college tier, category labels. Surface-2 fill
 * + border instead of a semantic tone, so it reads as "categorical
 * metadata" rather than "status/severity" (see Badge above).
 */
export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-border-subtle bg-bg-elevated-2 px-2.5 py-0.5 font-mono text-xs text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}
