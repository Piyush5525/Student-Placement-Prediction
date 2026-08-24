import { GlassPanel } from "@/components/ui/glass-panel";
import { ProbabilityGauge } from "@/components/charts";
import { Reveal } from "@/components/motion/reveal";
import { FactorBar } from "@/components/dashboard";
import { mockFactorContributions, mockPlacementProbability, mockConfidenceScore } from "@/mock/prediction";

const TOP_FACTORS = mockFactorContributions.slice(0, 4);
const MAX_ABS_IMPACT = Math.max(...TOP_FACTORS.map((f) => Math.abs(f.impact)));

/**
 * AI Prediction Demonstration — landing section 1 of 5. Reuses the real
 * ProbabilityGauge + FactorBar components from the Prediction page itself
 * (frontend/src/pages/app/prediction-page.tsx) inside the browser-chrome
 * glass preview card pattern established in Hero (Cosmoq screenshot,
 * references/screenshots/landing_page/) — a genuine preview of the actual
 * product UI, not a generic mockup graphic.
 */
export function PredictionShowcase() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container max-w-content px-4">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">AI Prediction</span>
            <h2 className="mt-3 text-2xl font-display font-semibold text-text-primary md:text-3xl">
              One honest number, backed by the factors behind it
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
              Every prediction ships with a confidence score and a ranked breakdown of what's actually moving the
              needle — not a black-box percentage. See exactly which signals help, which hurt, and by how much.
            </p>
            <ul className="mt-6 flex flex-col gap-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Recalculates live as your profile changes
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Confidence score, not just a raw percentage
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> What-If Simulator to test scenarios before you commit
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <GlassPanel blur="lg" fill="mid" className="rounded-lg p-4 md:p-6">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
                <span className="size-2.5 rounded-full bg-danger/60" />
                <span className="size-2.5 rounded-full bg-warning/60" />
                <span className="size-2.5 rounded-full bg-success/60" />
                <span className="ml-3 font-mono text-xs text-text-muted">placement-ai.app/app/prediction</span>
              </div>
              <div className="mt-5 flex flex-col items-center gap-2 text-center">
                <ProbabilityGauge value={mockPlacementProbability} size="md" />
                <p className="text-xs text-text-secondary">Confidence score: {mockConfidenceScore}%</p>
              </div>
              <div className="mt-6 flex flex-col gap-2.5 border-t border-border-subtle pt-5">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">What's driving this</p>
                {TOP_FACTORS.map((factor) => (
                  <FactorBar key={factor.label} label={factor.label} impact={factor.impact} maxAbsImpact={MAX_ABS_IMPACT} />
                ))}
              </div>
            </GlassPanel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
