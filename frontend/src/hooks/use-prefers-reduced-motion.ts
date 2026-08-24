import { useEffect, useState } from "react";
import { useThemeStore } from "@/stores/theme-store";

/**
 * Single source of truth for "should motion be reduced right now" —
 * combines the OS-level `prefers-reduced-motion` media query with the
 * explicit in-app override (Settings → Appearance, FRONTEND_ARCHITECTURE
 * §6.14). Either one being true wins; there is no way to force motion back
 * on when the OS requests reduction.
 *
 * Every animation-driving system (Framer Motion variants, GSAP timelines,
 * the R3F render loop) reads from this single hook rather than querying
 * `matchMedia` independently, so they can never disagree — see
 * FRONTEND_ARCHITECTURE §3.2.
 */
export function usePrefersReducedMotion(): boolean {
  const override = useThemeStore((s) => s.reducedMotionOverride);
  const [osPrefersReduced, setOsPrefersReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (event: MediaQueryListEvent) => setOsPrefersReduced(event.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  return osPrefersReduced || override;
}
