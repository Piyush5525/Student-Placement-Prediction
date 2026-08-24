import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/lib/motion";

interface RankedBarListProps {
  data: { label: string; value: number }[];
  max?: number;
  className?: string;
}

/** Horizontal ranked progress bars — DESIGN_SYSTEM §07/§08, mirrors the "Overall Performance" radar+list pattern. */
export function RankedBarList({ data, max = 100, className }: RankedBarListProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {data.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-sm text-text-secondary">{item.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-elevated-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: DURATION.recompute, ease: EASE.expoOut, delay: i * 0.05 }}
              className="h-full rounded-full bg-gradient-to-r from-accent-from to-accent-to"
            />
          </div>
          <span className="w-8 shrink-0 text-right font-mono text-xs tabular-nums text-text-muted">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
