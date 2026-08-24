import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, SectionCard } from "@/components/dashboard";
import { TrendChart } from "@/components/charts";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Avatar } from "@/components/ui/avatar";
import { Chip, Badge } from "@/components/ui/badge";
import { mockLeaderboardEntries, mockTopMovers, mockSelfRankTrend, SELF_ID } from "@/mock/leaderboard";
import type { LeaderboardEntry, LeaderboardLens } from "@/mock/leaderboard";
import { cn } from "@/lib/cn";
import { staggerContainer, revealVariants } from "@/lib/motion";

const LENS_OPTIONS: { label: string; value: LeaderboardLens }[] = [
  { label: "Placement Probability", value: "probability" },
  { label: "Coding Score", value: "coding" },
  { label: "Most Improved", value: "improved" },
  { label: "Skill Rating", value: "skillRating" },
];

const SCOPE_OPTIONS: { label: string; value: "global" | "college" | "branch" }[] = [
  { label: "Global", value: "global" },
  { label: "My College", value: "college" },
  { label: "My Branch", value: "branch" },
];

function lensValue(entry: LeaderboardEntry, lens: LeaderboardLens): number {
  if (lens === "probability") return entry.probability;
  if (lens === "coding") return entry.codingScore;
  if (lens === "improved") return entry.improvedDelta;
  return entry.skillRating;
}

function formatLensValue(entry: LeaderboardEntry, lens: LeaderboardLens): string {
  if (lens === "improved") {
    const v = entry.improvedDelta;
    return `${v > 0 ? "+" : ""}${v}%`;
  }
  return `${lensValue(entry, lens)}%`;
}

/**
 * Leaderboard — FRONTEND_ARCHITECTURE §6.11. One ranked list, four lenses
 * on the same student pool. Podium hero for top 3, ranked list below, the
 * current student's row always visible (pinned if scrolled past). No
 * backend — search stays scoped to the mock pool, matching the spec's
 * privacy-respecting constraint in shape even without real cross-user data.
 */
export function LeaderboardPage() {
  const [lens, setLens] = useState<LeaderboardLens>("probability");
  const [scope, setScope] = useState<"global" | "college" | "branch">("global");
  const [search, setSearch] = useState("");

  const self = mockLeaderboardEntries.find((e) => e.id === SELF_ID)!;

  const scoped = useMemo(() => {
    if (scope === "college") return mockLeaderboardEntries.filter((e) => e.collegeTier === self.collegeTier);
    if (scope === "branch") return mockLeaderboardEntries.filter((e) => e.branch === self.branch);
    return mockLeaderboardEntries;
  }, [scope, self]);

  const sorted = useMemo(
    () => [...scoped].sort((a, b) => lensValue(b, lens) - lensValue(a, lens)),
    [scoped, lens],
  );

  const searched = useMemo(
    () => (search ? sorted.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())) : sorted),
    [sorted, search],
  );

  const podium = searched.slice(0, 3);
  const rest = searched.slice(3);
  const selfRank = sorted.findIndex((e) => e.id === SELF_ID) + 1;
  const selfInVisibleList = searched.some((e) => e.id === SELF_ID);

  return (
    <div>
      <PageHeader title="Leaderboard" description="See how you rank against your peers — four lenses, one pool." />

      <div className="flex flex-col items-center gap-3">
        <SegmentedControl options={LENS_OPTIONS} value={lens} onChange={setLens} />
      </div>

      <SectionCard bodyPadded={false} className="mt-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl size="sm" options={SCOPE_OPTIONS} value={scope} onChange={setScope} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="ml-auto min-w-0 flex-1 rounded-full border border-border-subtle bg-bg-elevated-2 px-4 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-ink focus:outline-none focus:ring-2 focus:ring-accent-soft sm:max-w-[220px]"
          />
        </div>
      </SectionCard>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8">
          {/* Podium — top 3 */}
          {podium.length > 0 && (
            <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
              {[podium[1], podium[0], podium[2]].map((entry, i) =>
                entry ? <PodiumCard key={entry.id} entry={entry} lens={lens} place={i === 1 ? 1 : i === 0 ? 2 : 3} /> : <div key={i} />,
              )}
            </div>
          )}

          {/* Ranked list #4+ */}
          <SectionCard bodyPadded={false}>
            <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.03)} className="flex flex-col">
              {rest.map((entry, i) => (
                <motion.div key={entry.id} variants={revealVariants} layout>
                  <LeaderboardRow entry={entry} rank={i + 4} lens={lens} />
                </motion.div>
              ))}
              {!selfInVisibleList && (
                <div className="sticky bottom-0 border-t-2 border-accent-solid bg-bg-elevated-2">
                  <LeaderboardRow entry={self} rank={selfRank} lens={lens} pinned />
                </div>
              )}
            </motion.div>
          </SectionCard>
        </div>

        {/* Rails */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <SectionCard title="Top Movers" description="Biggest rank gains this period">
            <div className="flex flex-col gap-2">
              {mockTopMovers.map((mover) => (
                <div key={mover.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={mover.name} size="sm" />
                    <span className="text-sm text-text-secondary">{mover.name}</span>
                  </div>
                  <Badge tone="success">+{mover.delta}%</Badge>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Your Rank Trend" description={`Currently #${selfRank}`}>
            <TrendChart data={mockSelfRankTrend} xKey="period" series={[{ dataKey: "rank", color: "#22D3EE" }]} height={180} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ entry, lens, place }: { entry: LeaderboardEntry; lens: LeaderboardLens; place: 1 | 2 | 3 }) {
  return (
    <motion.div
      layout
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-bg-elevated p-5 text-center shadow-card",
        place === 1 && "border-accent-ink/40 bg-gradient-to-b from-accent-soft/40 to-bg-elevated sm:scale-105",
      )}
    >
      <Chip className="font-mono">#{place}</Chip>
      <Avatar name={entry.name} size={place === 1 ? "lg" : "md"} />
      <p className="text-sm font-semibold text-text-primary">{entry.name}</p>
      <div className="flex flex-wrap justify-center gap-1">
        <Chip>{entry.collegeTier}</Chip>
        <Chip>{entry.branch}</Chip>
      </div>
      <p className="bg-gradient-to-r from-accent-from to-accent-to bg-clip-text font-display text-2xl font-bold text-transparent">
        {formatLensValue(entry, lens)}
      </p>
    </motion.div>
  );
}

function LeaderboardRow({ entry, rank, lens, pinned }: { entry: LeaderboardEntry; rank: number; lens: LeaderboardLens; pinned?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border-subtle px-4 py-3 transition-colors last:border-b-0 hover:bg-bg-elevated-2",
        entry.isSelf && !pinned && "bg-accent-soft/40 hover:bg-accent-soft/60",
      )}
    >
      <span className="w-6 shrink-0 font-mono text-sm text-text-muted">#{rank}</span>
      <Avatar name={entry.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {entry.name} {entry.isSelf && <span className="text-xs text-accent-ink">(you)</span>}
        </p>
        <div className="mt-0.5 flex gap-1">
          <Chip className="text-[10px]">{entry.collegeTier}</Chip>
          <Chip className="text-[10px]">{entry.branch}</Chip>
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 font-mono text-sm font-semibold tabular-nums",
          lens === "improved" ? (entry.improvedDelta >= 0 ? "text-success" : "text-danger") : "text-text-primary",
        )}
      >
        {formatLensValue(entry, lens)}
      </span>
    </div>
  );
}
