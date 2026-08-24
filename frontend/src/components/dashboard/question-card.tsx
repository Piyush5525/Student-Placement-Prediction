import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { accordionVariants, DURATION, EASE } from "@/lib/motion";
import type { CompletionState, InterviewQuestion } from "@/mock/interview";

const DIFFICULTY_TONE = { Beginner: "success", Intermediate: "warning", Advanced: "danger" } as const;

const COMPLETION_LABEL: Record<CompletionState, string> = {
  unattempted: "Unattempted",
  attempted: "Attempted",
  mastered: "Mastered",
};

const COMPLETION_CLASS: Record<CompletionState, string> = {
  unattempted: "text-text-muted",
  attempted: "text-warning",
  mastered: "text-success",
};

const CONFIDENCE_LEVELS = [
  { value: 1, label: "Not confident" },
  { value: 2, label: "Getting there" },
  { value: 3, label: "Fairly confident" },
  { value: 4, label: "Confident" },
  { value: 5, label: "Very confident" },
];

/**
 * QuestionCard — FRONTEND_ARCHITECTURE §6.10. Collapsed: question text,
 * difficulty badge, category tag, three-state completion indicator,
 * estimated time. Click expands in place (accordion, same pattern as
 * Skill-Gap's SkillGapRow) to reveal guidance, a self-practice text area,
 * and a confidence self-rating that drives the completion state.
 */
export function QuestionCard({
  question,
  onConfidenceChange,
}: {
  question: InterviewQuestion;
  onConfidenceChange: (id: string, completion: CompletionState) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");

  function handleRate(value: number) {
    onConfidenceChange(question.id, value >= 4 ? "mastered" : "attempted");
  }

  return (
    <div className="rounded-md border border-border-subtle bg-bg-elevated shadow-card">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-col gap-3 p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-text-primary">{question.question}</p>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: DURATION.micro, ease: EASE.expoOut }}
            className="mt-0.5 shrink-0 text-text-muted"
            aria-hidden="true"
          >
            ⌄
          </motion.span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={DIFFICULTY_TONE[question.difficulty]}>{question.difficulty}</Badge>
          <Chip>{question.category}</Chip>
          <span className="font-mono text-xs text-text-muted">~{question.estimatedMinutes} min</span>
          <span className={cn("ml-auto font-mono text-xs uppercase tracking-wider", COMPLETION_CLASS[question.completion])}>
            {COMPLETION_LABEL[question.completion]}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={accordionVariants}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 border-t border-border-subtle px-4 py-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-text-muted">What a strong answer covers</p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{question.guidance}</p>
              </div>

              <div>
                <label htmlFor={`draft-${question.id}`} className="font-mono text-xs uppercase tracking-wider text-text-muted">
                  Draft your own answer
                </label>
                <textarea
                  id={`draft-${question.id}`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  placeholder="Practice writing your answer here — it's only saved locally."
                  className="mt-1.5 w-full resize-none rounded-md border border-border-subtle bg-bg-elevated-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
                />
              </div>

              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-text-muted">How confident do you feel about this?</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {CONFIDENCE_LEVELS.map((level) => (
                    <Button key={level.value} variant="ghost" size="sm" onClick={() => handleRate(level.value)}>
                      {level.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
