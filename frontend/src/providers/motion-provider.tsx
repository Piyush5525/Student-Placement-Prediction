import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Wraps the app in Framer Motion's <MotionConfig>, which is the single
 * global switch Framer respects for reduced motion — every variant in
 * lib/motion.ts collapses to instant/opacity-only automatically when
 * `reducedMotion="user"` is active and the OS/override flag is set,
 * without each component branching individually.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>{children}</MotionConfig>
  );
}
