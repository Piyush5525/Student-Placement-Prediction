import { useEffect, useState } from "react";

export type QualityTier = "high" | "medium" | "low";

const FPS_FLOOR = 30;
const SAMPLE_WINDOW_MS = 2000;

/**
 * Repeatedly samples frame timing in SAMPLE_WINDOW_MS windows for as long as
 * the scene is mounted and returns a quality tier for the 3D scene to
 * consume (particle count, post-processing on/off) — implements the
 * "sustained <30fps for 2s drops one tier" guardrail from
 * DESIGN_SYSTEM.html §06 Performance limits.
 *
 * Re-sampling on a rolling window (rather than once at mount) matters: a
 * single cold-start window can be slow for reasons that don't recur (shader
 * compile, initial GC) and shouldn't permanently pin a low tier for the rest
 * of the session; conversely a scene that starts fine but degrades later
 * (another tab stealing GPU time) should still be able to downgrade.
 *
 * Foundation-level: exposes the tier signal. The actual particle-count /
 * bloom-toggle response to each tier lives with the ProbabilityCore3D
 * scene itself (page content, not scaffolded here).
 */
export function useFpsQualityTier(enabled: boolean): QualityTier {
  const [tier, setTier] = useState<QualityTier>("high");

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let rafId: number;
    let windowStart = performance.now();

    const tick = () => {
      frameCount += 1;
      const elapsed = performance.now() - windowStart;
      if (elapsed < SAMPLE_WINDOW_MS) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const fps = (frameCount / elapsed) * 1000;
      if (fps < FPS_FLOOR) {
        setTier((prev) => (prev === "high" ? "medium" : prev === "medium" ? "low" : "low"));
      }
      frameCount = 0;
      windowStart = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [enabled]);

  return tier;
}
