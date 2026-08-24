import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver wrapper — backs the "mount only when
 * viewport-visible, unmount when scrolled past" rule for the 3D scene
 * (FRONTEND_ARCHITECTURE §4 performance guardrails) and the
 * `triggerOnce` counter/reveal pattern (§3.1).
 */
export function useInView<T extends HTMLElement>(options?: {
  triggerOnce?: boolean;
  rootMargin?: string;
  threshold?: number;
}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const { triggerOnce = false, rootMargin = "0px", threshold = 0.1 } = options ?? {};

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [triggerOnce, rootMargin, threshold]);

  return { ref, inView };
}
