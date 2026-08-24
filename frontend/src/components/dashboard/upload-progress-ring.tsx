import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * UploadProgressRing — FRONTEND_ARCHITECTURE §6.9. Small circular progress
 * during parse/analysis, distinct from ProbabilityGauge (which shows the
 * *result*, not upload progress). Indeterminate spin while `progress` is
 * undefined, determinate sweep once a numeric 0–100 is supplied.
 */
export function UploadProgressRing({ progress, label }: { progress?: number; label: string }) {
  const offset = progress !== undefined ? CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE : CIRCUMFERENCE * 0.75;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex size-11 items-center justify-center">
        <motion.svg
          width={44}
          height={44}
          viewBox="0 0 44 44"
          className="-rotate-90"
          animate={progress === undefined ? { rotate: 270 } : undefined}
          transition={progress === undefined ? { duration: 1.1, ease: "linear", repeat: Infinity } : undefined}
        >
          <circle cx="22" cy="22" r={RADIUS} fill="none" stroke="var(--border-subtle-rgba)" strokeWidth="4" />
          <motion.circle
            cx="22"
            cy="22"
            r={RADIUS}
            fill="none"
            stroke="#7C6CFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.4, ease: EASE.expoOut }}
          />
        </motion.svg>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        {progress !== undefined && (
          <span className="font-mono text-xs text-text-muted">{Math.round(progress)}%</span>
        )}
      </div>
    </div>
  );
}
