import { useEffect, useState } from "react";

export type DeviceTier = "mobile" | "desktop";

const MOBILE_QUERY = "(max-width: 767px), (pointer: coarse)";

/**
 * Coarse device classification for the 3D scene's initial particle budget
 * — DESIGN_SYSTEM §06 "Mobile optimization": start conservative on touch/
 * small-viewport devices rather than waiting 2s for the FPS probe
 * (use-fps-quality-tier.ts) to react after the fact. The FPS probe still
 * runs on top of this and can downgrade further if the initial guess was
 * too optimistic.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(() =>
    typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
      ? "mobile"
      : "desktop",
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const listener = (event: MediaQueryListEvent) => setTier(event.matches ? "mobile" : "desktop");
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  return tier;
}
