import { useEffect, type RefObject } from "react";

/** Fires `handler` on pointerdown outside every ref in `refs` — dropdown/menu dismiss pattern. */
export function useClickOutside(refs: RefObject<HTMLElement | null>[], handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const isInside = refs.some((ref) => ref.current?.contains(target));
      if (!isInside) handler();
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [refs, handler, enabled]);
}
