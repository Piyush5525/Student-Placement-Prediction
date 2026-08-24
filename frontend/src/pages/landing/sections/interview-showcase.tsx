import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge, Chip } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { mockInterviewQuestions } from "@/mock/interview";

const DIFFICULTY_TONE = { Beginner: "success", Intermediate: "warning", Advanced: "danger" } as const;
const PREVIEW_QUESTIONS = mockInterviewQuestions.filter((q) => q.category === "Technical").slice(0, 3);

/**
 * Interview Preparation showcase — landing section 3 of 5. Reuses the
 * same difficulty-badge/Chip pattern as the real QuestionCard component
 * (frontend/src/components/dashboard/question-card.tsx) so the preview is
 * visually identical to the product, just non-interactive here.
 */
export function InterviewShowcase() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container max-w-content px-4">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">Interview Preparation</span>
            <h2 className="mt-3 text-2xl font-display font-semibold text-text-primary md:text-3xl">
              Practice the questions that actually get asked
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
              HR, technical, and company-specific question banks with model-answer guidance for each — self-rate your
              confidence and get a personalized path through what to practice next.
            </p>
            <ul className="mt-6 flex flex-col gap-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Difficulty-tagged, searchable question bank
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Company-specific prep, matched to your top fits
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-solid" /> Confidence tracking by topic
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <GlassPanel blur="lg" fill="mid" className="rounded-lg p-4 md:p-6">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
                <span className="size-2.5 rounded-full bg-danger/60" />
                <span className="size-2.5 rounded-full bg-warning/60" />
                <span className="size-2.5 rounded-full bg-success/60" />
                <span className="ml-3 font-mono text-xs text-text-muted">placement-ai.app/app/interview</span>
              </div>
              <div className="mt-5 flex flex-col gap-2.5">
                {PREVIEW_QUESTIONS.map((q) => (
                  <div key={q.id} className="rounded-md border border-border-subtle bg-bg-elevated p-3.5 shadow-card">
                    <p className="text-sm font-medium text-text-primary">{q.question}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={DIFFICULTY_TONE[q.difficulty]}>{q.difficulty}</Badge>
                      <Chip>{q.category}</Chip>
                      <span className="font-mono text-xs text-text-muted">~{q.estimatedMinutes} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
