import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import type { WebGLRenderer } from "three";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ensureGlobalPointerTracking } from "@/stores/pointer-store";
import { AmbientField } from "./ambient-field";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Persistent full-page ambient background — mounted once at the marketing
 * layout root, `position: fixed` behind every section. Replaces the old
 * per-section Probability Core / Showcase Core scenes, which mounted and
 * unmounted as their section scrolled in and out of view (the source of
 * the "elements disappearing while scrolling" flicker). This canvas mounts
 * once and is never conditionally unmounted for the lifetime of the
 * marketing surface — sections scroll *over* it, not through separate
 * instances of it.
 *
 * Two layers, same as the Cosmoq/Trionn references: a 2D aurora-gradient
 * glow (cheap, always renders even without WebGL) plus the 3D ambient
 * field of drifting glass nodes on top. Falls back to the gradient alone
 * under reduced motion or missing WebGL — same visual slot, zero JS scene
 * graph, per DESIGN_SYSTEM's fallback rule.
 */
export function AmbientBackground() {
  const reducedMotion = usePrefersReducedMotion();
  const webglAvailable = useMemo(() => typeof window !== "undefined" && hasWebGL(), []);
  const show3D = webglAvailable && !reducedMotion;
  const rendererRef = useRef<WebGLRenderer | null>(null);

  useEffect(() => {
    ensureGlobalPointerTracking();
  }, []);

  // Explicit, synchronous GL context teardown on unmount — this canvas
  // lives for the whole marketing surface, and when a login/signup redirect
  // swaps the route tree to the authenticated AppShell, React unmounts this
  // component in the same commit the sidebar mounts in. Left to the
  // browser's own driver-level cleanup, that WebGL context loss happens
  // asynchronously (visible as a delayed "Context Lost" console message)
  // and was intermittently swallowing the very next click the user made on
  // the new sidebar — the first post-login navigation silently failed while
  // every click after it worked fine. Forcing context loss + disposing the
  // renderer here, synchronously in the cleanup function, removes that
  // async window entirely.
  useEffect(() => {
    return () => {
      const renderer = rendererRef.current;
      if (!renderer) return;
      renderer.dispose();
      renderer.forceContextLoss();
      rendererRef.current = null;
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Aurora gradient glow — always present, 2D, GPU-cheap. Sits under
          the 3D field so the field's glow has a warm/cool base to blend
          into rather than pure black. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 22% 15%, rgba(124,108,255,0.14), transparent 65%), " +
            "radial-gradient(50% 40% at 82% 70%, rgba(34,211,238,0.12), transparent 65%), " +
            "radial-gradient(70% 60% at 50% 100%, rgba(245,177,76,0.08), transparent 70%)",
        }}
      />

      {show3D && (
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 45, position: [0, 0, 6] }}
          onCreated={({ gl }) => {
            rendererRef.current = gl;
          }}
          className="!absolute inset-0"
        >
          <Suspense fallback={null}>
            <AmbientField />
          </Suspense>
        </Canvas>
      )}

      {/* Vignette — keeps the field from reading as "busy" at the edges,
          matches the old showcase section's depth treatment. */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(120% 100% at 50% 0%, transparent 55%, rgba(5,6,10,0.55) 100%)",
        }}
      />
    </div>
  );
}
