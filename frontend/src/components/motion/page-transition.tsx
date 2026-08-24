import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { pageTransitionVariants } from "@/lib/motion";

/**
 * Route-level transition wrapper — FRONTEND_ARCHITECTURE §3.1.2. Wraps
 * whatever the router outlet renders, keyed on pathname, so route changes
 * fade+rise in per the shared motion vocabulary instead of hard-cutting.
 *
 * Deliberately enter-only (no AnimatePresence/exit here): an exit-animated
 * route transition gates the next page's mount on the previous page's exit
 * animation resolving, and under real navigation speed (a user clicking a
 * second sidebar link before the first transition finishes) that exit can
 * get abandoned mid-flight — leaving the outgoing page's DOM stuck behind
 * the incoming one until a hard reload clears it. Losing the exit fade
 * costs little visually since the incoming page's fade+rise covers the cut;
 * it's not worth that failure mode for a route-level transition that fires
 * on every navigation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}
