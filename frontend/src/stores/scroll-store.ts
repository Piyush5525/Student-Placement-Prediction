import { create } from "zustand";

interface ScrollState {
  /** Raw page scroll position in px — the one shared source for any UI that
   * needs "how far down the page are we" (progress bar, nav blur toggle,
   * ambient background parallax) instead of each registering its own
   * scroll listener. */
  scrollY: number;
  setScrollY: (value: number) => void;
}

/**
 * Single shared scroll-progress store — used for page-level scroll
 * position only. Section-local scroll-scrubbed progress (e.g. the pinned
 * Feature Showcase) instead flows through a Framer Motion MotionValue fed
 * directly by its own GSAP ScrollTrigger, not this store — that keeps
 * high-frequency scroll updates out of React state entirely, since every
 * consumer of a MotionValue subscribes without triggering a re-render.
 * This store remains the "shared scroll-progress context" required by
 * FRONTEND_ARCHITECTURE §3.2 for the things that do need React-visible
 * state (nav blur toggle, scroll progress bar).
 */
export const useScrollStore = create<ScrollState>((set) => ({
  scrollY: 0,
  setScrollY: (scrollY) => set({ scrollY }),
}));
