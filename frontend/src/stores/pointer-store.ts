import { create } from "zustand";

interface PointerState {
  /** Normalized -1..1, same convention as R3F's own pointer state. */
  x: number;
  y: number;
  setPointer: (x: number, y: number) => void;
}

/**
 * Global normalized pointer position, tracked at the window level rather
 * than via react-three-fiber's built-in `useThree().pointer` — R3F only
 * updates its internal pointer from events dispatched *to the canvas
 * element*, but the Probability Core's canvas is deliberately
 * `pointer-events-none` (so the 3D layer never blocks clicks on the
 * headline/buttons stacked above it in the hero). That combination meant
 * the canvas never received pointer events at all, so R3F's pointer
 * stayed frozen at its default — the cursor-tilt/drift/repulsion code was
 * running against a value that never changed. Tracking at `window` level
 * sidesteps `pointer-events-none` entirely and, as a side effect, is also
 * what makes touch-drag work on mobile (touchmove still fires on the
 * window regardless of what's under the finger).
 */
export const usePointerStore = create<PointerState>((set) => ({
  x: 0,
  y: 0,
  setPointer: (x, y) => set({ x, y }),
}));

let listenerAttached = false;

/** Idempotent — safe to call from every scene that needs pointer tracking; attaches window listeners exactly once. */
export function ensureGlobalPointerTracking() {
  if (listenerAttached || typeof window === "undefined") return;
  listenerAttached = true;

  const update = (clientX: number, clientY: number) => {
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = -(clientY / window.innerHeight) * 2 + 1;
    usePointerStore.getState().setPointer(x, y);
  };

  window.addEventListener(
    "pointermove",
    (event) => update(event.clientX, event.clientY),
    { passive: true },
  );
  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (touch) update(touch.clientX, touch.clientY);
    },
    { passive: true },
  );
}
