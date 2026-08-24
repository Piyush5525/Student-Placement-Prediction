import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "./priority-badge";
import type { ImpactLevel } from "@/mock/recommendations";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/lib/motion";

interface RecommendationCardProps {
  title: string;
  description: string;
  impact: ImpactLevel;
  meta?: ReactNode;
  className?: string;
}

/**
 * RecommendationCard — FRONTEND_ARCHITECTURE §6.4/§6.9: one specific
 * actionable suggestion, an impact PriorityBadge, and a "Mark as working
 * on" toggle. Reused verbatim across Dashboard's improvement list, the
 * AI Recommendation Center's projects/certifications, and Skill-Gap's
 * suggestions — same anatomy, same interaction, everywhere.
 */
export function RecommendationCard({ title, description, impact, meta, className }: RecommendationCardProps) {
  const [inProgress, setInProgress] = useState(false);

  return (
    <Card padding="default" className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <PriorityBadge level={impact} />
      </div>
      <p className="text-sm text-text-secondary">{description}</p>
      {meta && <div className="text-xs text-text-muted">{meta}</div>}
      <button
        type="button"
        onClick={() => setInProgress((v) => !v)}
        className={cn(
          "flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          inProgress
            ? "border-success/30 bg-success/12 text-success"
            : "border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary",
        )}
      >
        <motion.span
          animate={{ scale: inProgress ? [1, 1.3, 1] : 1 }}
          transition={{ duration: DURATION.component, ease: EASE.expoOut }}
          className={cn("size-1.5 rounded-full", inProgress ? "bg-success" : "bg-text-muted")}
        />
        {inProgress ? "Working on it" : "Mark as working on"}
      </button>
    </Card>
  );
}
