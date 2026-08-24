import { GlassPanel } from "@/components/ui/glass-panel";
import { TrendChart } from "@/components/charts";
import { Reveal } from "@/components/motion/reveal";
import { mockPredictionHistory, mockPlacementProbability, mockPredictedSalaryLpa } from "@/mock/prediction";

const STATS = [
  { label: "Placement Probability", value: `${mockPlacementProbability}%` },
  { label: "Predicted Salary", value: `₹${mockPredictedSalaryLpa.toFixed(1)}L` },
  { label: "Top Company Match", value: "94%" },
];

/**
 * Dashboard preview — landing section 5 of 5, closing showcase before the
 * trust band. Wider, centered glass panel (not the alternating text+
 * preview layout of the other 4 showcases) since this is meant to read as
 * "here is the whole product," echoing the Cosmoq reference's hero preview
 * card but scaled up as the sequence's closing beat — reuses the real
 * TrendChart component with the same prediction-history mock data as
 * Dashboard/Analytics.
 */
export function DashboardPreview() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container max-w-content px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">Dashboard</span>
          <h2 className="mt-3 text-2xl font-display font-semibold text-text-primary md:text-3xl">
            Everything in one place, updated the moment your profile changes
          </h2>
          <p className="mt-3 text-sm text-text-secondary md:text-base">
            Probability, salary, skill gaps, and recommendations — one connected view, not a stack of disconnected
            reports.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <GlassPanel blur="lg" fill="mid" className="mx-auto max-w-4xl rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <span className="size-2.5 rounded-full bg-danger/60" />
              <span className="size-2.5 rounded-full bg-warning/60" />
              <span className="size-2.5 rounded-full bg-success/60" />
              <span className="ml-3 font-mono text-xs text-text-muted">placement-ai.app/app/dashboard</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {STATS.map((stat) => (
                <div key={stat.label} className="rounded-md border border-border-subtle bg-bg-elevated-2 p-4 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{stat.label}</p>
                  <p className="mt-1.5 bg-gradient-to-r from-accent-from to-accent-to bg-clip-text font-display text-xl font-bold text-transparent md:text-2xl">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-md border border-border-subtle bg-bg-elevated-2 p-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">Performance Analytics</p>
              <TrendChart
                data={mockPredictionHistory}
                xKey="date"
                series={[{ dataKey: "probability", color: "#7C6CFF" }]}
                height={180}
              />
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}
