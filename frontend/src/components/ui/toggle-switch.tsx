import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { LAYOUT_SPRING } from "@/lib/motion";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

/**
 * ToggleSwitch — FRONTEND_ARCHITECTURE §6.14 Settings spec: animated
 * switch, saves immediately on change (no separate save button for atomic,
 * reversible toggles).
 */
export function ToggleSwitch({ checked, onChange, label, id }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-accent-solid" : "bg-bg-elevated-3",
      )}
    >
      <motion.span
        layout
        transition={LAYOUT_SPRING}
        className="size-4 rounded-full bg-white shadow"
        style={{ marginLeft: checked ? "calc(100% - 1.25rem)" : "0.25rem" }}
      />
    </button>
  );
}
