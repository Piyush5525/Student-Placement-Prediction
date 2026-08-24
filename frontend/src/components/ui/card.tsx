import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { cardHoverVariants } from "@/lib/motion";

type CardSurface = "elevated" | "nested";
type CardPadding = "compact" | "default" | "hero";

interface CardProps extends HTMLMotionProps<"div"> {
  surface?: CardSurface;
  padding?: CardPadding;
  /** Enables the standard lift + shadow-bloom hover interaction (§05). */
  interactive?: boolean;
}

const surfaceClasses: Record<CardSurface, string> = {
  elevated: "bg-bg-elevated border border-border-subtle",
  nested: "bg-bg-elevated-2 border border-border-subtle",
};

const paddingClasses: Record<CardPadding, string> = {
  compact: "p-3",
  default: "p-6",
  hero: "p-8",
};

/**
 * Elevated-surface card — the atomic dashboard unit (DESIGN_SYSTEM §04/§08).
 * Depth comes from border + layered shadow only, deliberately NOT
 * backdrop-filter — see GlassPanel for the true-glass counterpart used on
 * floating chrome instead.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { surface = "elevated", padding = "default", interactive = false, className, ...props },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        initial="rest"
        whileHover={interactive ? "hover" : undefined}
        variants={interactive ? cardHoverVariants : undefined}
        className={cn(
          "rounded-md shadow-card",
          surfaceClasses[surface],
          paddingClasses[padding],
          interactive && "cursor-pointer",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";
