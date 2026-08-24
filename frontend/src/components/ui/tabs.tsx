import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { LAYOUT_SPRING } from "@/lib/motion";

interface TabsProps<T extends string> {
  tabs: { label: string; value: T; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Underline tabs — DESIGN_SYSTEM §08: active tab gets a 2px accent-gradient
 * underline that slides between positions via layoutId (same shared-layout
 * spring mechanism as the marketing nav's active-link indicator and
 * SegmentedControl's active pill — one motion vocabulary, three surfaces).
 */
export function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  const layoutId = useId();

  return (
    <div className={cn("flex items-center gap-1 border-b border-border-subtle", className)}>
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-bg-elevated-2 px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.span
                layoutId={`tabs-underline-${layoutId}`}
                transition={LAYOUT_SPRING}
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
