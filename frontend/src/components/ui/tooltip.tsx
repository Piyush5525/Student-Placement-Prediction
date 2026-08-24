import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { GlassPanel } from "./glass-panel";
import { DURATION } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  /** ms before the tooltip appears — DESIGN_SYSTEM §08 specifies 100ms. */
  delay?: number;
  /** Wraps longer explanatory text instead of the default single-line label. */
  wrap?: boolean;
}

/** Glass tooltip, blur/sm, per DESIGN_SYSTEM §08 feedback/overlay spec. */
export function Tooltip({ content, children, delay = 100, wrap = false }: TooltipProps) {
  const [open, setOpen] = useState(false);
  let timer: ReturnType<typeof setTimeout>;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => {
        timer = setTimeout(() => setOpen(true), delay);
      }}
      onMouseLeave={() => {
        clearTimeout(timer);
        setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: DURATION.micro }}
            className="absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2"
          >
            <GlassPanel
              blur="sm"
              className={cn(
                "rounded-sm px-2.5 py-1.5 text-xs text-text-secondary",
                wrap ? "w-48 whitespace-normal" : "whitespace-nowrap",
              )}
            >
              {content}
            </GlassPanel>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
