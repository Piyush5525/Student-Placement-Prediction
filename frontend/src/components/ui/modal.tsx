import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { GlassPanel } from "./glass-panel";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Modal — DESIGN_SYSTEM §08. True glass, blur/xl, centered, radius-lg,
 * backdrop scrim at 60% opacity. Closes on backdrop click or Escape.
 */
export function Modal({ open, onClose, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.component }}
            className="absolute inset-0 bg-bg-base/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: DURATION.page, ease: EASE.expoOut }}
            className="relative z-10 w-full max-w-md"
          >
            <GlassPanel blur="xl" fill="heavy" className={cn("rounded-lg p-6", className)}>
              {children}
            </GlassPanel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
