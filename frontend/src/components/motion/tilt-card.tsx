import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";
import { DURATION, EASE, SPRING } from "@/lib/motion";

/**
 * 3D tilt-toward-cursor card — DESIGN_SYSTEM §08 "Feature card (marketing)"
 * hover spec: rotateX/rotateY ±6°, perspective 800px, spring-damped follow.
 * Disabled entirely under reduced motion (falls back to a plain hover lift).
 */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, SPRING.follow);
  const springY = useSpring(y, SPRING.follow);

  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        reducedMotion
          ? undefined
          : { rotateX, rotateY, transformPerspective: 800 }
      }
      whileHover={{ y: -4 }}
      transition={{ duration: DURATION.component, ease: EASE.symmetric }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
