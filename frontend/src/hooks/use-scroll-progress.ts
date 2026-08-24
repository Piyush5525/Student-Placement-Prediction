import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/**
 * Drives a 0–1 progress value from a GSAP ScrollTrigger scrub over the
 * given element, writing into the caller-supplied setter (typically a
 * Zustand store field — see stores/scroll-store.ts). This is the single
 * bridge between GSAP's scroll tracking and anything else that needs
 * scroll position (the R3F Probability Core, in-view checkpoints),
 * satisfying FRONTEND_ARCHITECTURE §3.2's "one shared scroll-progress
 * context" rule — GSAP owns the raw scroll listener, everything else
 * reads the derived value.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement>,
  onUpdate: (progress: number) => void,
  options?: { start?: string; end?: string; pin?: boolean },
) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reducedMotion) {
      onUpdate(1);
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: node,
      start: options?.start ?? "top bottom",
      end: options?.end ?? "bottom top",
      scrub: true,
      pin: options?.pin ?? false,
      onUpdate: (self) => onUpdate(self.progress),
    });

    return () => {
      trigger.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, reducedMotion, options?.start, options?.end, options?.pin]);
}

export { gsap };
