import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { DURATION, EASE } from "@/lib/motion";
import type { InterviewTip } from "@/mock/interview";

const ROTATE_INTERVAL_MS = 6000;

/**
 * TipCard — FRONTEND_ARCHITECTURE §6.10: persistent glass card with
 * rotating short-form tips, filtered to the active category. Auto-rotates
 * on a slow interval, respecting prefers-reduced-motion (static/manual
 * paging when set), with manual next/prev controls always available.
 */
export function TipCard({ tips }: { tips: InterviewTip[] }) {
  const [index, setIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setIndex(0);
  }, [tips]);

  useEffect(() => {
    if (reducedMotion || tips.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % tips.length), ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, tips.length]);

  if (tips.length === 0) return null;

  return (
    <GlassPanel blur="md" fill="light" className="flex items-center gap-3 rounded-md px-4 py-3">
      <span className="shrink-0 text-lg" aria-hidden="true">
        💡
      </span>
      <div className="min-h-[2.5em] flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={tips[index].id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: DURATION.component, ease: EASE.symmetric }}
            className="text-sm text-text-secondary"
          >
            {tips[index].tip}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + tips.length) % tips.length)}
          aria-label="Previous tip"
          className="flex size-6 items-center justify-center rounded-full text-text-muted hover:bg-bg-elevated-2 hover:text-text-primary"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % tips.length)}
          aria-label="Next tip"
          className="flex size-6 items-center justify-center rounded-full text-text-muted hover:bg-bg-elevated-2 hover:text-text-primary"
        >
          ›
        </button>
      </div>
    </GlassPanel>
  );
}
