# Frontend — Foundation

This is the application **foundation** only — no page content has been implemented yet, per the current build phase. It establishes the structure every future page will be built on top of.

Source of truth: [`docs/FRONTEND_ARCHITECTURE.md`](../docs/FRONTEND_ARCHITECTURE.md), [`docs/DESIGN_SYSTEM.html`](../docs/DESIGN_SYSTEM.html), [`docs/UI_WIREFRAMES.html`](../docs/UI_WIREFRAMES.html).

## What's here

- **Project structure** — `src/app` (routing/entry), `src/layouts` (MarketingLayout, AppShell), `src/components/{ui,nav,motion,three}`, `src/stores`, `src/hooks`, `src/providers`, `src/lib`.
- **Routing** — full route tree in `src/app/router.tsx`, mirroring the IA in FRONTEND_ARCHITECTURE §5 exactly. Every leaf currently renders `<RouteStub>` — swap in real pages without touching the tree's structure.
- **Theme system** — `src/stores/theme-store.ts` + `src/providers/theme-provider.tsx`. Dark default, light and system supported, stamped as `data-theme` on `<html>` per the three-state contract in `DESIGN_SYSTEM.html §02`.
- **Design tokens** — `tailwind.config.js` + `src/styles/tokens.css`. Every color/spacing/type/radius/blur/duration token from the design system is wired through, not re-guessed.
- **Global layout & navigation** — `AppShell` (sidebar + topbar, persists across route transitions) and `MarketingLayout` (floating glass nav), plus mobile drawers/tab bar.
- **UI primitives** — `src/components/ui`: `Button`, `GlassPanel`, `Card`, `Badge`/`Chip`, `Skeleton`, `Avatar`, `Tooltip`, `EmptyState`/`ErrorState`. Deliberately the subset needed to build layouts/nav — the full component inventory (ProbabilityGauge, charts, domain-specific cards) is page-level work.
- **State management** — `src/stores` (Zustand: theme, UI/sidebar, auth) + `src/lib/query-client.ts` + `query-keys.ts` (React Query).
- **Animation infrastructure** — `src/lib/motion.ts` (shared Framer Motion variants/easing), `src/lib/gsap.ts` (ScrollTrigger registration), `src/components/three/scene-canvas.tsx` (R3F canvas scaffold with performance guardrails), `src/hooks/use-prefers-reduced-motion.ts` (single shared reduced-motion source), `src/stores/scroll-store.ts` (shared scroll-progress store so GSAP and R3F never register competing listeners).

## What's deliberately not here

- No page content/copy/data for any route.
- No `ProbabilityCore3D` geometry/material (only the generic `SceneCanvas` wrapper).
- No charts (`ProbabilityGauge`, `RadarChart`, `TrendChart`, etc.) — Recharts is installed and configured as a dependency but no chart components exist yet.
- No forms wired to real validation schemas.
- No API client / backend integration.

## Getting started

```bash
npm install
npm run dev
```
