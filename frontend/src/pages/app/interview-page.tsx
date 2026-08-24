import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, SectionCard, QuestionCard, TipCard, SkillBar } from "@/components/dashboard";
import { RadarChart } from "@/components/charts";
import { Tabs } from "@/components/ui/tabs";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/empty-state";
import { mockInterviewQuestions, mockInterviewTips, mockInterviewLearningPath } from "@/mock/interview";
import { mockSkillRadar } from "@/mock/skills";
import type { QuestionCategory, QuestionDifficulty, CompletionState } from "@/mock/interview";
import { staggerContainer, revealVariants } from "@/lib/motion";

const CATEGORY_TABS: { label: string; value: QuestionCategory; count?: number }[] = [
  { label: "HR Interview", value: "HR" },
  { label: "Technical Interview", value: "Technical" },
];

const DIFFICULTY_OPTIONS: { label: string; value: QuestionDifficulty | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" },
];

/**
 * Interview Preparation — FRONTEND_ARCHITECTURE §6.10. Category tabs →
 * difficulty/search filter → question grid (expand-in-place) → persistent
 * Progress & Analytics rail. No backend — confidence ratings update local
 * component state only.
 */
export function InterviewPage() {
  const [category, setCategory] = useState<QuestionCategory>("Technical");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | "All">("All");
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState(mockInterviewQuestions);

  const categoryCounts = useMemo(
    () =>
      CATEGORY_TABS.reduce<Record<QuestionCategory, number>>(
        (acc, tab) => ({ ...acc, [tab.value]: questions.filter((q) => q.category === tab.value).length }),
        {} as Record<QuestionCategory, number>,
      ),
    [questions],
  );

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (q.category !== category) return false;
      if (difficulty !== "All" && q.difficulty !== difficulty) return false;
      if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [questions, category, difficulty, search]);

  function handleConfidenceChange(id: string, completion: CompletionState) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, completion } : q)));
  }

  const attempted = questions.filter((q) => q.completion !== "unattempted").length;
  const categoryProgress = CATEGORY_TABS.map((tab) => {
    const inCategory = questions.filter((q) => q.category === tab.value);
    const done = inCategory.filter((q) => q.completion !== "unattempted").length;
    return { label: tab.label, current: done, target: inCategory.length, max: inCategory.length || 1 };
  });

  return (
    <div>
      <PageHeader
        title="Interview Preparation"
        description="HR, technical, and company-specific questions — practice, self-rate, and track confidence by topic."
      />

      <TipCard tips={mockInterviewTips.filter((t) => t.category === category)} />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8">
          <SectionCard bodyPadded={false} className="p-4">
            <div className="flex flex-col gap-4">
              <Tabs
                tabs={CATEGORY_TABS.map((t) => ({ ...t, count: categoryCounts[t.value] }))}
                value={category}
                onChange={(value) => setCategory(value)}
              />

              <div className="flex flex-wrap items-center gap-3">
                <SegmentedControl size="sm" options={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions…"
                  className="ml-auto min-w-0 flex-1 rounded-full border border-border-subtle bg-bg-elevated-2 px-4 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-ink focus:outline-none focus:ring-2 focus:ring-accent-soft sm:max-w-[220px]"
                />
              </div>
            </div>
          </SectionCard>

          {filtered.length === 0 ? (
            <EmptyState
              title="No questions match your filters"
              description="Try a different difficulty, category, or search term."
              action={{ label: "Clear filters", onClick: () => { setDifficulty("All"); setSearch(""); } }}
            />
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer(0.05)}
              className="flex flex-col gap-3"
            >
              {filtered.map((q) => (
                <motion.div key={q.id} variants={revealVariants} layout>
                  <QuestionCard question={q} onConfidenceChange={handleConfidenceChange} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Progress & Analytics rail */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <SectionCard title="Your Progress">
            <p className="text-sm text-text-secondary">
              <span className="font-display text-2xl font-bold text-text-primary">{attempted}</span> / {questions.length} attempted
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {categoryProgress.map((p) => (
                <SkillBar key={p.label} label={p.label} current={p.current} max={p.max} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Confidence by Topic">
            <RadarChart data={mockSkillRadar} axisKey="skill" series={[{ dataKey: "current", color: "#7C6CFF" }]} height={220} />
          </SectionCard>

          <SectionCard title="Personalized Learning Path" description="What to practice next">
            <div className="flex flex-col gap-2">
              {mockInterviewLearningPath.map((item) => {
                const question = questions.find((q) => q.id === item.questionId);
                if (!question) return null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(question.category)}
                    className="rounded-md border border-border-subtle p-3 text-left transition-colors hover:bg-bg-elevated-2"
                  >
                    <p className="text-sm text-text-primary">{question.question}</p>
                    <p className="mt-1 text-xs text-text-muted">{item.reason}</p>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
