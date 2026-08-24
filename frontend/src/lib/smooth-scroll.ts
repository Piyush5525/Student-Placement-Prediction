import type Lenis from "lenis";

let activeLenis: Lenis | null = null;

/** Called by SmoothScrollProvider to register/unregister the live instance. */
export function setActiveLenis(instance: Lenis | null) {
  activeLenis = instance;
}

/**
 * Imperative escape hatch for anchor-link clicks (MarketingNav, Footer,
 * Hero) to route through Lenis's own eased `scrollTo`, so in-page nav
 * jumps share the same inertial feel as wheel scroll instead of native
 * instant-jump. A no-op when Lenis isn't mounted (reduced motion, or off
 * the marketing surface) — callers fall back to native anchor behavior.
 */
export function scrollToSmooth(target: string | HTMLElement, options?: { offset?: number }) {
  if (!activeLenis) return false;
  activeLenis.scrollTo(target, { duration: 1.1, offset: options?.offset ?? 0 });
  return true;
}
