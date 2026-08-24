import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { revealVariants, staggerContainer, REVEAL_IN_VIEW } from "@/lib/motion";

/**
 * Scroll-into-view fade+rise reveal — DESIGN_SYSTEM §05 "Reveal pattern."
 * Triggers once (never re-animates on scroll-back-up, per §05) via
 * IntersectionObserver.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(REVEAL_IN_VIEW);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={revealVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Staggered group wrapper — pairs with <RevealItem> children. */
export function RevealGroup({
  children,
  className,
  staggerChildren,
}: {
  children: ReactNode;
  className?: string;
  staggerChildren?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(REVEAL_IN_VIEW);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer(staggerChildren)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={revealVariants} className={className}>
      {children}
    </motion.div>
  );
}
