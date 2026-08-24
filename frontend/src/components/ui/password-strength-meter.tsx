import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/lib/motion";

function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const LEVEL: Record<number, { label: string; className: string }> = {
  0: { label: "Too short", className: "bg-border-strong" },
  1: { label: "Weak", className: "bg-danger" },
  2: { label: "Fair", className: "bg-warning" },
  3: { label: "Good", className: "bg-accent-solid" },
  4: { label: "Strong", className: "bg-success" },
};

/**
 * PasswordStrengthMeter — §6.2 signup spec: "animated segmented bar."
 * Four segments fill left-to-right as the score climbs; no numeric score
 * shown, just the qualitative label, matching the app's semantic-color
 * convention elsewhere (gauge, badges).
 */
export function PasswordStrengthMeter({ password, className }: { password: string; className?: string }) {
  const score = scorePassword(password);
  const { label, className: levelClassName } = LEVEL[score];

  if (!password) return null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-bg-elevated-2">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < score ? 1 : 0 }}
              transition={{ duration: DURATION.component, ease: EASE.expoOut }}
              style={{ transformOrigin: "left" }}
              className={cn("h-full rounded-full", levelClassName)}
            />
          </div>
        ))}
      </div>
      <span className="font-mono text-xs uppercase tracking-wider text-text-muted">{label}</span>
    </div>
  );
}
