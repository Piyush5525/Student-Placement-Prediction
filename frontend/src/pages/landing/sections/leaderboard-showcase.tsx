import { GlassPanel } from "@/components/ui/glass-panel";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { mockLeaderboardEntries } from "@/mock/leaderboard";

const TOP_THREE = mockLeaderboardEntries.slice(0, 3);

/**
 * Leaderboard showcase — landing section 4 of 5. Reuses the same
 * podium/rank-number visual language as the real Leaderboard page
 * (frontend/src/pages/app/leaderboard-page.tsx) — Chip rank badge, Avatar,
 * gradient-styled metric — condensed into a compact 3-row preview rather
 * than the full podium treatment, since this is a glass card, not a full
 * page.
 */
export function LeaderboardShowcase() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container max-w-content px-4">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <Reveal className="order-2 md:order-1">
            <GlassPanel blur="lg" fill="mid" className="rounded-lg p-4 md:p-6">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
                <span className="size-2.5 rounded-full bg-danger/60" />
                <span className="size-2.5 rounded-full bg-warning/60" />
                <span className="size-2.5 rounded-full bg-success/60" />
                <span className="ml-3 font-mono text-xs text-text-muted">placement-ai.app/app/leaderboard</span>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                {TOP_THREE.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-3 rounded-md border border-border-subtle bg-bg-elevated px-3.5 py-2.5 shadow-card">
                    <Chip className="font-mono">#{i + 1}</Chip>
                    <Avatar name={entry.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{entry.name}</p>
                      <p className="text-xs text-text-muted">{entry.branch}</p>
                    </div>
                    <span className="bg-gradient-to-r from-accent-from to-accent-to bg-clip-text font-display text-lg font-bold text-transparent">
                      {entry.probability}%
                    </span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </Reveal>

          <Reveal delay={0.1} className="order-1 md:order-2">
            <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">Leaderboard</span>
            <h2 className="mt-3 text-2xl font-display font-semibold text-text-primary md:text-3xl">
              See where you stand — against peers you can actually compare to
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
              Four ranking lenses — placement probability, coding score, most improved, and skill rating — scoped to
              your college or branch, not a demotivating global list of thousands.
            </p>
            <ul className="mt-6 flex flex-col gap-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Your rank is always visible, however far you scroll
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Scope to Global, My College, or My Branch
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Track your rank trend over time
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
