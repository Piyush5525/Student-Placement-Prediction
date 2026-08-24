import { useEffect, useRef } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { EASE, REVEAL_IN_VIEW } from "@/lib/motion";

interface AnimatedCounterProps {
  /** Target numeric value. */
  value: number;
  /** Decimal places to render (0 for integers). */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Count-up numeral — DESIGN_SYSTEM §05/§08. Triggers once on first
 * viewport entry (IntersectionObserver, triggerOnce) per
 * FRONTEND_ARCHITECTURE §3.1.5, counts from 0 with an expo-out ease so it
 * decelerates into the final digits. Respects reduced motion by jumping
 * straight to the final value.
 */
export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const { ref, inView } = useInView<HTMLSpanElement>(REVEAL_IN_VIEW);
  const reducedMotion = usePrefersReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => latest.toFixed(decimals));
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    if (reducedMotion) {
      motionValue.set(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: EASE.expoOut,
    });
    return () => controls.stop();
  }, [inView, value, reducedMotion, motionValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
