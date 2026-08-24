import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { LAYOUT_SPRING } from "@/lib/motion";

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Segmented control — DESIGN_SYSTEM §08: single track pill, active
 * segment is a smaller accent-solid pill that slides between positions
 * via a layoutId shared-layout spring (same mechanism as the marketing
 * nav's active-link indicator) rather than a hard cut.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: SegmentedControlProps<T>) {
  const layoutId = useId();

  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-full border border-border-subtle bg-bg-elevated-2 p-1", className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-full font-medium transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              isActive ? "text-white" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`segmented-${layoutId}`}
                transition={LAYOUT_SPRING}
                className="absolute inset-0 -z-10 rounded-full bg-accent-solid"
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
