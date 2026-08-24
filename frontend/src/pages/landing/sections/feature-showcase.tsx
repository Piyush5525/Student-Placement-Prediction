import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PredictionMascot } from "@/components/motion/prediction-mascot";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { EASE } from "@/lib/motion";

const CHECKPOINTS = [
  {
    label: "Placement Prediction",
    description: "A single, honest number — how likely you are to be placed this season.",
    preview: "78%",
    previewLabel: "probability",
  },
  {
    label: "Salary Prediction",
    description: "A realistic range, not a false-precision guess — benchmarked against your peers.",
    preview: "₹6.2–8.4L",
    previewLabel: "range",
  },
  {
    label: "Company Match",
    description: "See which companies fit your profile best, ranked by fit score.",
    preview: "94%",
    previewLabel: "fit",
  },
  {
    label: "Skill-Gap Analysis",
    description: "Exactly which skills are holding your probability back — and by how much.",
    preview: "4/6",
    previewLabel: "on target",
  },
] as const;

// Each checkpoint gets its own progress "window" within the pinned scroll
// range, and a distinct entrance transform per the requested sequence —
// Placement fades straight in, Salary slides up, Company enters
// horizontally, Skill-Gap scales in. Every card is otherwise mounted the
// whole time (never removed from the DOM), so there's no remount/reset —
// only opacity/transform interpolate against scroll progress, which is why
// scrolling back up correctly reverses the sequence instead of replaying
// an entrance animation from scratch.
const WINDOW = 1 / CHECKPOINTS.length;

function CheckpointCard({
  index,
  checkpoint,
  progress,
  reducedMotion,
}: {
  index: number;
  checkpoint: (typeof CHECKPOINTS)[number];
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const start = index * WINDOW;
  const end = start + WINDOW;
  // Reveal ramp: fully transparent until this card's window begins,
  // opaque by a third of the way through its own window — reads as
  // "progressively appears while scrolling," not an instant cut.
  const revealEnd = start + WINDOW * 0.35;
  const opacity = useTransform(progress, [start, revealEnd, end], [0, 1, 1]);
  const isActive = useTransform(progress, (v) => v >= start && v < end + (index === CHECKPOINTS.length - 1 ? 1 : 0));
  const [active, setActive] = useState(index === 0);

  useEffect(() => isActive.on("change", setActive), [isActive]);

  // Per-checkpoint entrance transform, per the requested sequence:
  const y = useTransform(progress, [start, revealEnd], index === 1 ? [28, 0] : [0, 0]);
  const x = useTransform(progress, [start, revealEnd], index === 2 ? [-36, 0] : [0, 0]);
  const scale = useTransform(progress, [start, revealEnd], index === 3 ? [0.85, 1] : [1, 1]);

  return (
    <motion.div
      style={
        reducedMotion
          ? undefined
          : {
              opacity,
              y,
              x,
              scale,
              willChange: "transform, opacity",
            }
      }
      animate={reducedMotion ? { opacity: 1 } : undefined}
      className="pointer-events-none"
    >
      <GlassPanel
        blur="sm"
        fill="light"
        animate={{
          scale: active ? 1 : 0.97,
          borderColor: active ? "rgba(124,108,255,0.35)" : "rgba(255,255,255,0.08)",
        }}
        transition={{ duration: 0.3, ease: EASE.symmetric }}
        className="rounded-md border p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-md font-semibold text-text-primary">{checkpoint.label}</h3>
            <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{checkpoint.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-xl font-bold text-accent-ink">{checkpoint.preview}</p>
            <p className="font-mono text-[10px] uppercase tracking-wide text-text-muted">{checkpoint.previewLabel}</p>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

/**
 * Feature Showcase / Prediction Visualization — FRONTEND_ARCHITECTURE
 * §6.1.5. Pinned section, scroll-scrubbed: each checkpoint card
 * progressively reveals with its own entrance transform as the user
 * scrolls, synchronized with a PredictionOrb visualization on the left
 * (adapted from references/video/ai.mp4 — see that component for the
 * reference breakdown).
 *
 * Scroll progress is a Framer Motion MotionValue fed directly from the
 * GSAP ScrollTrigger callback, NOT React/Zustand state — every card
 * transform and the orb's scale/rotate/color all subscribe to the same
 * MotionValue via useTransform, so scrolling drives GPU-compositable
 * style updates without a single React re-render per scroll tick (only
 * `active`, used for the border/scale emphasis, is real state, and it
 * only changes 4 times total — once per checkpoint boundary crossed).
 */
export function FeatureShowcase() {
  const sectionRef = useRef<HTMLElement>(null!);
  const reducedMotion = usePrefersReducedMotion();
  const progress = useMotionValue(0);

  useScrollProgress(sectionRef, (v) => progress.set(v), { start: "top top", end: "bottom bottom" });

  return (
    <section ref={sectionRef} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: "radial-gradient(50% 60% at 50% 50%, transparent 40%, rgba(5,6,10,0.4) 85%)",
          }}
          aria-hidden="true"
        />

        <div className="container relative z-10 grid max-w-content grid-cols-1 gap-8 px-4 md:grid-cols-2">
          <div className="hidden items-center justify-center md:flex" aria-hidden="true">
            <PredictionMascot progress={progress} />
          </div>

          <div className="flex flex-col gap-4">
            {CHECKPOINTS.map((checkpoint, index) => (
              <CheckpointCard
                key={checkpoint.label}
                index={index}
                checkpoint={checkpoint}
                progress={progress}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
