import { GlassPanel } from "@/components/ui/glass-panel";
import { ProbabilityGauge } from "@/components/charts";
import { KeywordChip } from "@/components/dashboard";
import { Reveal } from "@/components/motion/reveal";
import { mockResumeKeywords, mockAtsScore } from "@/mock/resume";

/**
 * Resume Analyzer showcase — landing section 2 of 5. Reuses ProbabilityGauge
 * (relabeled ATS score, same reuse rule as the real Resume Analyzer page —
 * frontend/src/pages/app/resume-page.tsx) and the real KeywordChip
 * component inside the browser-chrome glass preview pattern. Text/preview
 * sides mirror the AI Prediction section but reversed (preview left, copy
 * right) so consecutive showcase sections don't read as visually
 * monotonous — same alternating rhythm the Cosmoq-style reference implies
 * for a scrolling feature sequence.
 */
export function ResumeShowcase() {
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
                <span className="ml-3 font-mono text-xs text-text-muted">placement-ai.app/app/resume</span>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <ProbabilityGauge value={mockAtsScore} size="sm" label="ATS SCORE" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">resume_v3_final.pdf</p>
                  <p className="mt-1 text-xs text-text-secondary">Good ATS compatibility</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-border-subtle pt-5">
                {mockResumeKeywords.slice(0, 7).map((k) => (
                  <KeywordChip key={k.id} keyword={k.keyword} severity={k.severity} section={k.section} />
                ))}
              </div>
            </GlassPanel>
          </Reveal>

          <Reveal delay={0.1} className="order-1 md:order-2">
            <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">Resume Analyzer</span>
            <h2 className="mt-3 text-2xl font-display font-semibold text-text-primary md:text-3xl">
              Know exactly why a recruiter's ATS would skip your resume
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
              Upload once, get an ATS score, a keyword-by-keyword match against what the role expects, and a
              section-by-section structural audit — not just a vague "improve your resume" suggestion.
            </p>
            <ul className="mt-6 flex flex-col gap-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Matched, weak, and missing keywords — color-coded
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Structural audit against ATS expectations
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Version history to track improvement over time
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
