import { Link, useNavigate } from "react-router-dom";
import { PageHeader, SectionCard } from "@/components/dashboard";
import { ProbabilityGauge, TrendChart } from "@/components/charts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { useDashboard } from "@/hooks/use-dashboard";
import type { SemanticTone } from "@/components/ui/badge";

const CHANCE_TONE: Record<string, SemanticTone> = {
  "High Chance": "success",
  "Moderate Chance": "warning",
  "Low Chance": "danger",
};

const INSIGHT_TONE: Record<string, SemanticTone> = {
  strong: "success",
  watch: "warning",
};

const MIN_TREND_POINTS = 3;

/**
 * Student-focused Placement Prediction Dashboard — replaces the previous
 * company-recommendation-centric dashboard entirely. Every section here is
 * derived from GET /dashboard, which is itself derived from the real
 * trained model's output (see backend/app/services/dashboard_service.py) —
 * no company data, no mocked trend, no invented content.
 *
 * 1. Latest prediction — status, probability, chance category.
 * 2. Submitted information summary, with "Update Details" back into onboarding.
 * 3. Prediction history — list always; a trend chart only once there are
 *    enough real points (3+) for a line to mean anything.
 * 4. Insights — top model-important features vs. this student's values,
 *    worded as an association, never a guarantee.
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useDashboard();

  if (error && !data) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Dashboard" description="Your placement prediction at a glance." />
        <ErrorState description={error} onRetry={refetch} />
      </div>
    );
  }

  const latest = data?.latest_prediction;
  const chartData = (data?.history ?? []).map((h) => ({
    date: new Date(h.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    probability: h.placement_probability,
  }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome back${data ? `, ${data.student_name.split(" ")[0]}` : ""}`}
        description={data ? `${data.branch} · ${data.college_tier}` : "Loading..."}
      />

      {/* Section 1 — Latest prediction */}
      <Reveal>
        <Card padding="hero" className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          {isLoading || !data ? (
            <Skeleton className="size-[140px] shrink-0 rounded-full" />
          ) : latest ? (
            <ProbabilityGauge value={latest.placement_probability} size="md" />
          ) : null}

          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
            {isLoading || !data ? (
              <Skeleton className="h-8 w-48" />
            ) : latest ? (
              <>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge tone={latest.prediction === "Placed" ? "success" : "danger"}>
                    {latest.prediction === "Placed" ? "LIKELY TO BE PLACED" : "LIKELY NOT TO BE PLACED"}
                  </Badge>
                  <Badge tone={CHANCE_TONE[latest.chance_category]}>{latest.chance_category}</Badge>
                </div>
                <p className="text-sm text-text-secondary">
                  {latest.placement_probability.toFixed(2)}% chance of placement ·{" "}
                  {latest.not_placed_probability.toFixed(2)}% chance of not being placed
                </p>
                <p className="text-xs text-text-muted">
                  Last predicted {new Date(latest.created_at).toLocaleString()}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-text-primary">No prediction yet</p>
                <p className="text-sm text-text-secondary">Complete onboarding to see your placement prediction.</p>
              </>
            )}
            <div className="mt-2 flex gap-2">
              <Button variant="primary" size="sm" onClick={() => navigate("/app/prediction")}>
                Try What-If Simulator
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/onboarding")}>
                Update Details
              </Button>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Section 2 — Submitted information summary */}
      <SectionCard
        title="Your Submitted Information"
        description="The 11 details used for your prediction"
        action={
          <button
            type="button"
            onClick={() => navigate("/onboarding")}
            className="text-xs font-medium text-accent-ink hover:underline"
          >
            Update Details →
          </button>
        }
      >
        {isLoading || !data ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data.input_summary ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {[
              ["CGPA", data.input_summary.cgpa],
              ["10th %", `${data.input_summary.tenth_percentage}%`],
              ["12th %", `${data.input_summary.twelfth_percentage}%`],
              ["Backlogs", data.input_summary.backlogs],
              ["Major Projects", data.input_summary.major_projects],
              ["Mini Projects", data.input_summary.mini_projects],
              ["Workshops/Certs", data.input_summary.workshops_certifications],
              ["Skills Score", data.input_summary.skills],
              ["Communication", data.input_summary.communication_skill_rating],
              ["Internship", data.input_summary.internship],
              ["Hackathon", data.input_summary.hackathon],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs text-text-muted">{label}</p>
                <p className="text-sm font-semibold text-text-primary">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No details submitted yet"
            description="Complete onboarding to see your submitted information here."
            action={{ label: "Start onboarding", onClick: () => navigate("/onboarding") }}
          />
        )}
      </SectionCard>

      {/* Section 3 — Prediction history */}
      <SectionCard title="Prediction History" description="Every prediction you've run, most recent first">
        {isLoading || !data ? (
          <Skeleton className="h-[180px] w-full" />
        ) : data.history.length === 0 ? (
          <EmptyState title="No history yet" description="Predictions you run will show up here." />
        ) : (
          <div className="flex flex-col gap-5">
            {chartData.length >= MIN_TREND_POINTS && (
              <TrendChart
                data={chartData}
                xKey="date"
                series={[{ dataKey: "probability", color: "#7C6CFF" }]}
                height={200}
              />
            )}
            <div className="flex flex-col divide-y divide-border-subtle">
              {[...data.history].reverse().map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {h.prediction === "Placed" ? "Likely to be Placed" : "Likely Not to be Placed"}
                    </p>
                    <p className="text-xs text-text-muted">{new Date(h.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm tabular-nums text-text-secondary">
                      {h.placement_probability.toFixed(1)}%
                    </span>
                    <Badge tone={CHANCE_TONE[h.chance_category]}>{h.chance_category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Section 4 — Insights, derived from real trained-model feature importance */}
      <SectionCard
        title="Insights"
        description="Factors the model weighs heavily, and how you compare to the dataset average"
      >
        {isLoading || !data ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data.insights.length === 0 ? (
          <EmptyState title="No insights yet" description="Complete onboarding to see how your profile compares." />
        ) : (
          <div className="flex flex-col gap-3">
            {data.insights.map((insight) => (
              <div
                key={insight.label}
                className="flex items-start justify-between gap-3 rounded-sm border border-border-subtle bg-bg-elevated-2 px-3.5 py-3"
              >
                <p className="text-sm text-text-secondary">{insight.explanation}</p>
                <Badge tone={INSIGHT_TONE[insight.tone]} className="shrink-0">
                  {insight.tone === "strong" ? "Strong" : "Watch"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {data && (
        <p className="text-center text-xs text-text-muted">
          <Link to="/app/profile" className="text-accent-ink hover:underline">
            View full profile →
          </Link>
        </p>
      )}
    </div>
  );
}
