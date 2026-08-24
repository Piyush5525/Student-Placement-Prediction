import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/lib/motion";

export type ButtonVariant = "primary" | "ghost" | "icon" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  // GradientButton — DESIGN_SYSTEM §08
  primary:
    "bg-gradient-to-br from-accent-from to-accent-to text-white font-semibold shadow-card hover:shadow-card-hover",
  // GhostButton
  ghost:
    "bg-transparent border border-border-subtle text-text-secondary hover:bg-bg-elevated-2 hover:border-border-strong hover:text-text-primary",
  // IconButton — circular, transparent, icon-only
  icon: "bg-transparent text-text-secondary hover:bg-bg-elevated-2 hover:text-text-primary rounded-full !p-2.5",
  // DangerButton
  danger: "bg-transparent border border-danger/40 text-danger hover:bg-danger/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-5 py-3 gap-2",
  lg: "text-base px-6 py-3.5 gap-2.5",
};

/**
 * Single Button primitive covering the four button variants specified in
 * DESIGN_SYSTEM.html §08 (GradientButton / GhostButton / IconButton /
 * DangerButton) — one component, not four, since they share anatomy and
 * only differ in fill/border/hover treatment.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", className, isLoading, disabled, children, ...props },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={disabled || isLoading ? undefined : { scale: variant === "icon" ? 1.08 : 1.02 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        transition={{ duration: DURATION.micro, ease: EASE.expoOut }}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-body transition-colors",
          "disabled:opacity-40 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
          variantClasses[variant],
          variant !== "icon" && sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span
            className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
        ) : (
          children
        )}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
