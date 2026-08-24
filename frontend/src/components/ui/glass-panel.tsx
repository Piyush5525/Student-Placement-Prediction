import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { cardHoverVariants } from "@/lib/motion";

type GlassBlur = "sm" | "md" | "lg" | "xl";
type GlassFill = "light" | "mid" | "heavy";
type GlassElement = "div" | "nav" | "aside" | "header";

// Native HTMLAttributes and Framer's HTMLMotionProps both declare
// onAnimationStart/onDrag* with incompatible signatures — extending
// HTMLMotionProps<"div"> (rather than plain HTMLAttributes) is what
// <Card> and <Button> already do to sidestep the collision.
interface GlassPanelProps extends HTMLMotionProps<"div"> {
  blur?: GlassBlur;
  fill?: GlassFill;
  /** Renders as a different element, e.g. "nav" or "aside". */
  as?: GlassElement;
  /** Standard hover lift + shadow-bloom, same as <Card interactive> — DESIGN_SYSTEM §05. */
  interactive?: boolean;
}

const blurClasses: Record<GlassBlur, string> = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

const fillClasses: Record<GlassFill, string> = {
  light: "bg-glass-fill-light",
  mid: "bg-glass-fill",
  heavy: "bg-glass-fill-heavy",
};

// Defined once at module scope — motion(Component) inside render would
// mint a new component type every render, breaking animation continuity.
const MotionDiv = motion.div;
const MotionNav = motion.nav;
const MotionAside = motion.aside;
const MotionHeader = motion.header;

const motionComponents = {
  div: MotionDiv,
  nav: MotionNav,
  aside: MotionAside,
  header: MotionHeader,
} as const;

/**
 * True glass surface — DESIGN_SYSTEM.html §04. Reserved for elements that
 * FLOAT ABOVE other content: nav, modals, sheets, dropdowns, tooltips, the
 * landing hero's dashboard preview card. NOT for standard dashboard cards
 * sitting on the flat bg-base canvas — those use <Card> (elevated surface,
 * no backdrop-filter) so blur always has something rich behind it to blur.
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ blur = "lg", fill = "mid", as = "div", interactive = false, className, ...props }, ref) => {
    const MotionComponent = motionComponents[as];
    return (
      <MotionComponent
        ref={ref as never}
        initial="rest"
        whileHover={interactive ? "hover" : undefined}
        variants={interactive ? cardHoverVariants : undefined}
        className={cn(
          "relative rounded-lg border border-glass-border shadow-glass will-change-transform",
          "before:absolute before:inset-0 before:rounded-lg before:pointer-events-none",
          "before:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.10),transparent_60%)]",
          blurClasses[blur],
          fillClasses[fill],
          interactive && "cursor-default",
          className,
        )}
        {...props}
      />
    );
  },
);

GlassPanel.displayName = "GlassPanel";
