/**
 * Shared motion vocabulary — DESIGN_SYSTEM.html §05.
 * Every Framer Motion variant, GSAP ease, and CSS transition in the app
 * pulls from this file rather than hand-rolling bezier/duration values,
 * so motion reads as one system (FRONTEND_ARCHITECTURE §3.2).
 */

export const EASE = {
  /** Reveals, entrances, gauge sweeps, counter count-ups. */
  expoOut: [0.16, 1, 0.3, 1] as const,
  /** Page transitions, tab switches, cross-fades. */
  symmetric: [0.65, 0, 0.35, 1] as const,
} as const;

/** Matches tailwind.config.js transitionDuration tokens, in ms. */
export const DURATION = {
  micro: 0.16,
  component: 0.3,
  page: 0.45,
  recompute: 0.8,
} as const;

/** Framer Motion layout-spring — layoutId shared transitions (card → sheet, gauge → header). */
export const LAYOUT_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
};

/**
 * Shared spring presets — every hover/follow/drag interaction picks one of
 * these rather than hand-tuning stiffness/damping per component, so pointer-
 * driven motion reads as one physical system across the app.
 */
export const SPRING = {
  /** layoutId transitions — tabs underline, segmented control, nav pill. */
  layout: LAYOUT_SPRING,
  /** Cursor-follow effects — magnetic buttons, tilt cards, scroll progress fill. */
  follow: { type: "spring" as const, stiffness: 300, damping: 30 },
} as const;

/**
 * Shared reveal-on-scroll defaults — every `useInView`-backed reveal (Reveal,
 * RevealGroup, ad-hoc scroll-triggered elements) uses this threshold/margin
 * so "has this entered view" answers consistently everywhere.
 */
export const REVEAL_IN_VIEW = {
  triggerOnce: true,
  threshold: 0.15,
  rootMargin: "0px",
} as const;

/** Route-level page transition — AnimatePresence at the router outlet. */
export const pageTransitionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.page, ease: EASE.expoOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: DURATION.component, ease: EASE.symmetric },
  },
};

/** Standard scroll/mount reveal — fade + rise, used across marketing sections. */
export const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE.expoOut },
  },
};

/** Stagger container for groups of reveal children (max ~6 before stagger caps per §05). */
export const staggerContainer = (staggerChildren = 0.06) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren: 0.04 },
  },
});

/** Card hover-lift — standard elevated-surface card interaction. */
export const cardHoverVariants = {
  rest: { y: 0, boxShadow: "0 8px 40px rgba(0,0,0,0.35)" },
  hover: {
    y: -4,
    boxShadow: "0 12px 56px rgba(0,0,0,0.45)",
    transition: { duration: DURATION.component, ease: EASE.symmetric },
  },
};

/** Accordion / expand-in-place (SkillGapRow, QuestionCard). */
export const accordionVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: { duration: DURATION.component, ease: EASE.expoOut },
  },
};

/** Cross-fade only, no directional slide (Settings section switch, tab content). */
export const crossFadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.component, ease: EASE.symmetric } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE.symmetric } },
};

/** Direction-aware slide+fade — onboarding wizard steps. */
export function stepVariants(direction: 1 | -1) {
  return {
    initial: { opacity: 0, x: direction * 24 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: DURATION.component, ease: EASE.expoOut },
    },
    exit: {
      opacity: 0,
      x: direction * -24,
      transition: { duration: 0.2, ease: EASE.symmetric },
    },
  };
}
