import { motion, useSpring, useMotionValue } from "framer-motion";
import { useEffect } from "react";
import { useScrollStore } from "@/stores/scroll-store";
import { SPRING } from "@/lib/motion";

/**
 * Thin top progress bar tracking overall page scroll — FRONTEND_ARCHITECTURE
 * §6.1 Components. Derives its progress from the shared scroll store (fed by
 * Lenis/GSAP, see SmoothScrollProvider) rather than registering its own
 * `useScroll()` listener, per §3.2's "one shared scroll-progress context."
 */
export function ScrollProgressIndicator() {
  const scrollY = useScrollStore((s) => s.scrollY);
  const progress = useMotionValue(0);
  const scaleX = useSpring(progress, { ...SPRING.follow, restDelta: 0.001 });

  useEffect(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.set(max > 0 ? Math.min(scrollY / max, 1) : 0);
  }, [scrollY, progress]);

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-accent-from to-accent-to"
    />
  );
}
