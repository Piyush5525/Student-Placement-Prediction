import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { setActiveLenis } from "@/lib/smooth-scroll";
import { useScrollStore } from "@/stores/scroll-store";

/**
 * Real inertial smooth scrolling (Apple-trackpad-like easing on wheel/touch)
 * — the CSS `scroll-behavior: smooth` in globals.css only covers anchor-link
 * jumps, not ongoing wheel scroll, so it can't produce this feel on its own.
 *
 * Driven from GSAP's own ticker (not a separate requestAnimationFrame loop)
 * so Lenis and ScrollTrigger share one RAF and never fight over frame
 * timing — this is the integration pattern GSAP's docs recommend for Lenis.
 * `lagSmoothing(0)` disables GSAP's own catch-up jump after a long task,
 * which otherwise causes a visible stutter once Lenis is driving scroll.
 *
 * Marketing-only (mounted by MarketingLayout): this is where the
 * scroll-scrubbed 3D showcase and pinned sections live and benefit most;
 * the authenticated app shell's own internal scroll containers are left
 * on native scroll. See lib/smooth-scroll.ts for the imperative
 * `scrollToSmooth` escape hatch anchor links use.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      // No Lenis instance under reduced motion — still publish raw scroll
      // position to the shared store so consumers (nav blur toggle, scroll
      // progress bar) keep working off native scroll instead of each
      // standing up its own listener.
      const setScrollY = useScrollStore.getState().setScrollY;
      const onScroll = () => setScrollY(window.scrollY);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // expo-out-ish cubic — matches EASE.expoOut's decelerate feel
      smoothWheel: true,
      touchMultiplier: 1.2,
    });

    const setScrollY = useScrollStore.getState().setScrollY;
    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      ScrollTrigger.update();
      setScrollY(scroll);
    });
    setActiveLenis(lenis);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      setActiveLenis(null);
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
