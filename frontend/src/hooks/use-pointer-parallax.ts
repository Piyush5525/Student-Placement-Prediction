import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/**
 * Drives a CSS custom-property-based parallax offset from pointer position,
 * writing directly to the DOM via a ref (no React re-render per mousemove)
 * so it stays GPU-cheap — same discipline as the animation-system pass:
 * only `transform` moves, nothing triggers layout.
 *
 * `depth` scales how far the element travels relative to the pointer —
 * pass a smaller value for background layers and a larger one for
 * foreground layers so multiple elements using this hook at different
 * depths produce real multi-layer parallax rather than moving in lockstep.
 */
export function usePointerParallax<T extends HTMLElement>(depth: number) {
  const ref = useRef<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const node = ref.current;
    if (!node) return;

    const current = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let rafId: number;

    function handlePointerMove(event: PointerEvent) {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      target = { x: x * depth, y: y * depth };
    }

    function tick() {
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;
      if (node) {
        node.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(rafId);
    };
  }, [depth, reducedMotion]);

  return ref;
}
