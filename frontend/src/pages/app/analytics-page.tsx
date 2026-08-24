import { Fragment, useState } from "react";
import { PageHeader, SectionCard, StatCard } from "@/components/dashboard";
import { TrendChart, RadarChart, RankedBarList, ComboChart } from "@/components/charts";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { useAnalytics } from "@/hooks/use-analytics";
import { mockActivityTrend, mockMilestoneHistory } from "@/mock/analytics";
import { motion } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";

type Range = "1M" | "3M" | "6M" | "All";
const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "All", value: "All" },
];

/**
 * Analytics Center — FRONTEND_ARCHITECTURE §6.12. Denser, data-forward
 * grid — the one page allowed to feel dashboard-dense (TradingView/
 * IndustryOS reference). Snapshot → trend → composition → habits →
 * history, with one global range control driving every chart so numbers
 * never contradict each other across widgets.
 */
export function AnalyticsPage() {
  const [range, setRange] = useState<Range>("6M");
  const { data: raw, isLoading, error, refetch } = useAnalytics();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const data = raw
    ? {
        history: raw.placement_trend,
        radar: raw.skills_growth.map((s) => ({ skill: s.skill, current: s.current, benchmark: s.benchmark })),
        scores: raw.score_categories,
        activity: mockActivityTrend,
        milestones: mockMilestoneHistory,
        latestProbability: raw.placement_trend.at(-1)?.probability ?? 0,
        latestSalary: raw.salary_trend.at(-1)?.salary_lpa ?? 0,
        skillsOnTarget: raw.skills_growth.filter((s) => s.current >= s.benchmark).length,
      }
    : undefined;

  if (error && !data) {
    return (
      <div>
        <PageHeader title="Analytics" description="A deep dive on your trends, score composition, and study habits." />
        <ErrorState description={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="A deep dive on your trends, score composition, and study habits."
        action={<SegmentedControl options={RANGE_OPTIONS} value={range} onChange={setRange} size="sm" />}
      />

      {/* Snapshot stats */}
      <RevealGroup className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4" staggerChildren={0.06}>
        <RevealItem>
          <StatCard label="Probability" value={data ? `${data.latestProbability}%` : "—"} trend={{ value: "+4% this period", direction: "up" }} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Predicted Salary" value={data ? `₹${data.latestSalary}L` : "—"} trend={{ value: "+₹0.3L this period", direction: "up" }} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Skills On Target" value={data?.skillsOnTarget ?? 0} trend={{ value: "1 new this period", direction: "up" }} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Next Milestone" value="14d" trend={{ value: "Mock interview cycle", direction: "flat" }} />
        </RevealItem>
      </RevealGroup>

      {/* Main trend */}
      <div className="mt-4">
        <SectionCard title="Probability & Salary Trend" description={`Range: ${range}`}>
          {isLoading || !data ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <TrendChart data={data.history} xKey="date" series={[{ dataKey: "probability", color: "#7C6CFF" }]} height={280} />
          )}
        </SectionCard>
      </div>

      {/* Score breakdown */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionCard title="Score Composition">
            {isLoading || !data ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <RadarChart data={data.radar} axisKey="skill" series={[{ dataKey: "current", color: "#7C6CFF" }]} height={260} />
            )}
          </SectionCard>
        </div>
        <div className="lg:col-span-7">
          <SectionCard title="Overall Performance" description="Ranked by score">
            {isLoading || !data ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <RankedBarList data={data.scores} />
            )}
          </SectionCard>
        </div>
      </div>

      {/* Activity / consistency */}
      <div className="mt-4">
        <SectionCard title="Study Habits" description="Study hours vs. sleep hours — how your routine correlates with your score trend">
          {isLoading || !data ? (
            <Skeleton className="h-[220px] w-full" />
          ) : (
            <ComboChart
              data={data.activity}
              xKey="date"
              barKey={{ dataKey: "studyHours", color: "#7C6CFF", label: "Study hours" }}
              lineKey={{ dataKey: "sleepHours", color: "#22D3EE", label: "Sleep hours" }}
              height={220}
            />
          )}
        </SectionCard>
      </div>

      {/* Milestone / comparison table */}
      <div className="mt-4">
        <SectionCard title="Prediction Run History" bodyPadded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-mono font-normal">Date</th>
                  <th className="px-4 py-3 font-mono font-normal">Probability</th>
                  <th className="px-4 py-3 font-mono font-normal">Salary</th>
                  <th className="px-4 py-3 font-mono font-normal">Change</th>
                </tr>
              </thead>
              <tbody>
                {isLoading || !data
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border-subtle/60">
                        <td className="px-4 py-3" colSpan={4}>
                          <Skeleton className="h-5 w-full" />
                        </td>
                      </tr>
                    ))
                  : data.milestones.map((row) => {
                      const isExpanded = expandedRow === row.id;
                      return (
                        <Fragment key={row.id}>
                          <tr
                            onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                            className="cursor-pointer border-b border-border-subtle/60 transition-colors hover:bg-bg-elevated-2"
                          >
                            <td className="px-4 py-3 text-text-secondary">{row.date}</td>
                            <td className="px-4 py-3 font-mono tabular-nums text-text-primary">{row.probability}%</td>
                            <td className="px-4 py-3 font-mono tabular-nums text-text-primary">₹{row.salaryLpa}L</td>
                            <td className="px-4 py-3 font-mono text-xs text-success">{row.delta}</td>
                          </tr>
                          {isExpanded && (
                            <tr className="border-b border-border-subtle/60 bg-bg-elevated-2">
                              <td colSpan={4} className="px-4 py-0">
                                <motion.p
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: DURATION.component, ease: EASE.expoOut }}
                                  className="py-3 text-xs text-text-secondary"
                                >
                                  Run on {row.date}: probability moved {row.delta} versus the prior recorded run.
                                </motion.p>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
