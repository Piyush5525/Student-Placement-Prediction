import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Shared page-header anatomy for every /app/* route — title + description left, optional action right. */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.component, ease: EASE.expoOut }}
      className="mb-6 flex flex-wrap items-start justify-between gap-4"
    >
      <div>
        <h1 className="text-xl font-display font-semibold text-text-primary">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-text-secondary">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}
