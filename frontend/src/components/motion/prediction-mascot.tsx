import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface PredictionMascotProps {
  /** 0–1 scroll progress through the pinned showcase — drives which
   * checkpoint's accent color the mascot's ring halo blends toward, and its
   * idle bob/tilt, keeping the mascot and the card sequence visibly the
   * same animation rather than two unrelated things sharing a section. */
  progress: MotionValue<number>;
}

// One accent per checkpoint, in sequence — the halo rings blend through
// these as `progress` advances: Placement (violet) → Salary (cyan) →
// Company (amber) → Skill-Gap (violet-cyan mix). Same throughline the prior
// orb used, applied to the ring/eye colors here instead of a wave gradient.
const STOP_COLORS = ["#7C6CFF", "#22D3EE", "#F5B14C", "#9B7CFF"];

/**
 * PredictionMascot — a friendly rounded robot-face illustration (rounded
 * square head, two simple dot eyes, soft concentric ring halo), reskinned
 * from a light pastel-blue reference into this app's dark/glass palette so
 * it reads as native to the product rather than pasted in from elsewhere.
 * Replaces PredictionOrb as the Feature Showcase's left-side visualization
 * — same drop-in `progress` contract, same animation discipline: every
 * animated property is transform/opacity (GPU-compositable) or an SVG
 * attribute write via a ref inside a single requestAnimationFrame loop,
 * never React state, so nothing here re-renders while scrolling.
 */
export function PredictionMascot({ progress }: PredictionMascotProps) {
  const reducedMotion = usePrefersReducedMotion();
  const ring1Ref = useRef<SVGCircleElement>(null);
  const ring2Ref = useRef<SVGCircleElement>(null);
  const headRef = useRef<SVGRectElement>(null);
  const rafRef = useRef<number>(0);

  // Scroll-driven scale + gentle tilt — spring-smoothed so the mascot
  // settles rather than snapping 1:1 to scroll velocity, matching the
  // spring approach already used elsewhere (marketing-nav, scroll bar).
  const smoothProgress = useSpring(progress, { stiffness: 90, damping: 24, mass: 0.6 });
  const scale = useTransform(smoothProgress, [0, 1], [0.9, 1.05]);
  const rotate = useTransform(smoothProgress, [0, 1], [-4, 4]);

  useEffect(() => {
    if (reducedMotion) return;

    let elapsed = 0;
    let last = performance.now();

    function tick(now: number) {
      const delta = (now - last) / 1000;
      last = now;
      elapsed += delta;

      // Idle bob — subtle vertical drift on the head shape, cheap (one sin
      // call), written straight to the SVG transform attribute via a ref so
      // this loop never touches React state/re-renders regardless of frame
      // rate.
      if (headRef.current) {
        const bob = Math.sin(elapsed * 1.1) * 4;
        headRef.current.setAttribute("transform", `translate(0 ${bob})`);
      }

      // Ring-halo color blends through the checkpoint palette as scroll
      // progress advances — same throughline the accumulating cards use,
      // so the mascot and the card sequence read as one synchronized
      // animation.
      const colorProgress = progress.get();
      const stageFloat = colorProgress * (STOP_COLORS.length - 1);
      const stageIndex = Math.min(STOP_COLORS.length - 2, Math.floor(stageFloat));
      const stageT = stageFloat - stageIndex;
      if (ring1Ref.current) ring1Ref.current.setAttribute("stroke", STOP_COLORS[stageIndex]);
      if (ring2Ref.current) {
        ring2Ref.current.setAttribute("stroke", STOP_COLORS[stageIndex + 1]);
        ring2Ref.current.setAttribute("stroke-opacity", String(0.45 + stageT * 0.3));
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [progress, reducedMotion]);

  return (
    <motion.div
      style={{ scale: reducedMotion ? 1 : scale, rotate: reducedMotion ? 0 : rotate, willChange: "transform" }}
      className="relative mx-auto aspect-square w-full max-w-[380px]"
      aria-hidden="true"
    >
      {/* Soft outer glow — translucent, blurred, same glassmorphism
          light-source treatment the rest of the app's glass surfaces use. */}
      <div
        className="absolute inset-0 rounded-full opacity-60 blur-2xl"
        style={{
          background: "radial-gradient(closest-side, rgba(124,108,255,0.3), rgba(34,211,238,0.12), transparent 75%)",
        }}
      />

      <svg viewBox="0 0 400 400" className="relative size-full">
        <defs>
          <linearGradient id="mascot-head-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B1E2B" />
            <stop offset="100%" stopColor="#0B0C14" />
          </linearGradient>
          <radialGradient id="mascot-head-sheen" cx="35%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#F5F6FA" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F5F6FA" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric ring halo — the reference image's layered pastel rings,
            recolored to the app's accent palette and blended per checkpoint. */}
        <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(124,108,255,0.12)" strokeWidth="26" />
        <circle ref={ring1Ref} cx="200" cy="200" r="150" fill="none" stroke={STOP_COLORS[0]} strokeOpacity="0.3" strokeWidth="18" />
        <circle ref={ring2Ref} cx="200" cy="200" r="150" fill="none" stroke={STOP_COLORS[1]} strokeOpacity="0.45" strokeWidth="10" />

        {/* Rounded-square head + simple dot eyes — the mascot's face, bobbing gently. */}
        <g ref={headRef}>
          <rect x="120" y="120" width="160" height="160" rx="52" fill="url(#mascot-head-fill)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          <rect x="120" y="120" width="160" height="160" rx="52" fill="url(#mascot-head-sheen)" />

          {/* Eyebrows */}
          <path d="M158 178 q14 -10 28 0" stroke="rgba(245,246,250,0.55)" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M214 178 q14 -10 28 0" stroke="rgba(245,246,250,0.55)" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Eyes */}
          <circle cx="172" cy="206" r="13" fill="#F5F6FA" />
          <circle cx="176" cy="202" r="4" fill="#0B0C14" />
          <circle cx="228" cy="206" r="13" fill="#F5F6FA" />
          <circle cx="232" cy="202" r="4" fill="#0B0C14" />
        </g>
      </svg>
    </motion.div>
  );
}
