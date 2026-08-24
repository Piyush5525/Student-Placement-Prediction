import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { LAYOUT_SPRING } from "@/lib/motion";

interface StepProgressProps {
  steps: string[];
  currentStep: number; // 0-indexed
  className?: string;
}

/**
 * Onboarding step indicator — line-connected dots (completed = filled
 * accent-solid + check, current = accent-solid ring, upcoming = subtle
 * border), matching the app's existing pill/dot visual language
 * (SegmentedControl, ProbabilityGauge) rather than introducing a new motif.
 */
export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center">
        {steps.map((label, i) => {
          const isComplete = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "relative flex size-8 items-center justify-center rounded-full border font-mono text-xs font-semibold transition-colors",
                    isComplete && "border-accent-solid bg-accent-solid text-white",
                    isCurrent && "border-accent-solid text-accent-ink",
                    !isComplete && !isCurrent && "border-border-subtle text-text-muted",
                  )}
                >
                  {isCurrent && (
                    <motion.span
                      layoutId="step-progress-ring"
                      transition={LAYOUT_SPRING}
                      className="absolute inset-0 rounded-full ring-2 ring-accent-soft"
                    />
                  )}
                  {isComplete ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="size-4">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isCurrent ? "text-text-primary" : "text-text-muted",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 h-px flex-1 bg-border-subtle sm:-mt-5">
                  <motion.div
                    initial={false}
                    animate={{ width: isComplete ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                    className="h-px bg-accent-solid"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
