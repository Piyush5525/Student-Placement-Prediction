import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Registered at module-evaluation time, not inside a React effect —
 * effect ordering runs children before parents, so a layout-level
 * `useEffect` calling this too late loses the race against a child
 * section's own `useScrollProgress` effect creating a ScrollTrigger
 * before the plugin is registered. Since this module is only ever
 * imported from marketing-surface code (the landing page and its scroll
 * hooks), the registration cost is still never paid on authenticated
 * `/app/*` routes — FRONTEND_ARCHITECTURE §4.
 */
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
