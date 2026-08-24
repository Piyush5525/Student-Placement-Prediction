import { motion, useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";
import { SPRING } from "@/lib/motion";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** Max pixel offset the button travels toward the cursor. Kept small — Apple-style subtlety, not a gimmick. */
  strength?: number;
}

/**
 * Magnetic hover wrapper — the button visually "pulls" toward the cursor
 * within its own bounding box, spring-damped back to rest on leave.
 * Wraps <Button> (or anything) rather than being a button itself, so it
 * composes with the existing Button variants without duplicating them.
 *
 * GPU-safe: animates only `x`/`y` transforms via Framer's motion values,
 * never layout properties, so it costs nothing beyond compositing.
 */
export function MagneticButton({ children, className, strength = 14 }: MagneticButtonProps) {
  const reducedMotion = usePrefersReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING.follow);
  const springY = useSpring(y, SPRING.follow);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
      className={cn("inline-flex will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
