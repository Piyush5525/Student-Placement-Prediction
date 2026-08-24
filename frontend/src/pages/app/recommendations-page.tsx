import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader, SectionCard, SkillBar, PriorityBadge, RecommendationCard } from "@/components/dashboard";
import { RadarChart } from "@/components/charts";
import { Tabs } from "@/components/ui/tabs";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Card } from "@/components/ui/card";
import { Badge, Chip } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";
import { Tooltip } from "@/components/ui/tooltip";
import { useRecommendations } from "@/hooks/use-recommendations";
import { mockSkillRadar } from "@/mock/skills";
import {
  mockRecommendedProjects,
  mockRecommendedCertifications,
  mockSuggestedTechnologies,
  mockLearningPaths,
  mockCareerGrowthRecommendations,
} from "@/mock/recommendations";
import { DURATION, EASE } from "@/lib/motion";

type Tab = "skills" | "growth";

const RADAR_MODE_OPTIONS = [
  { label: "Benchmark", value: "benchmark" as const },
  { label: "Target Company", value: "target" as const },
];

/**
 * Recommendation Center — Skill-Gap Analysis plus generic upskilling
 * content (projects/certs/learning path). The former "Company Matches" tab
 * was removed: this app's purpose is the 11-parameter placement prediction
 * model, not company/job matching, and that tab's data had no connection
 * to the trained model.
 *
 * Skill Gaps tab is wired to the real GET /recommendations endpoint.
 * Projects/Certifications/Technologies/Learning Path/Career Growth (the
 * "growth" tab) have no backend endpoint per the integration contract —
 * they intentionally remain on local mock data.
 */
export function RecommendationsPage() {
  const [tab, setTab] = useState<Tab>("skills");
  const [radarMode, setRadarMode] = useState<"benchmark" | "target">("benchmark");
  const [expandedGap, setExpandedGap] = useState<string | null>(null);

  const { data: raw, isLoading, error, refetch } = useRecommendations();

  const data = raw
    ? {
        radar: mockSkillRadar,
        gaps: raw.skills.map((s) => ({
          id: s.id,
          skill: s.skill,
          current: s.current,
          target: s.target,
          priority: s.priority as "High" | "Medium" | "Low",
          trend: "up" as const,
          suggestion: s.suggestion,
          resource: { label: "Recommended resource", provider: "PlacementAI" },
        })),
        projects: mockRecommendedProjects,
        certifications: mockRecommendedCertifications,
        technologies: mockSuggestedTechnologies,
        paths: mockLearningPaths,
        growth: mockCareerGrowthRecommendations,
      }
    : undefined;

  const TAB_OPTIONS: { label: string; value: Tab; count: number }[] = [
    { label: "Skill Gaps", value: "skills", count: data?.gaps.length ?? 0 },
    { label: "Projects & Growth", value: "growth", count: mockRecommendedProjects.length },
  ];

  if (error && !data) {
    return (
      <div>
        <PageHeader title="Recommendations" description="Skill gaps and a personalized plan to close them." />
        <ErrorState description={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Recommendations"
        description="Skill gaps and a personalized plan to close them."
      />

      <Tabs tabs={TAB_OPTIONS} value={tab} onChange={setTab} className="mb-6" />

      <AnimatePresence mode="wait">
        {tab === "skills" && (
          <motion.div
            key="skills"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.component, ease: EASE.symmetric }}
            className="flex flex-col gap-4"
          >
            <SectionCard
              title="Skill Radar"
              description="Your current scores vs. the platform benchmark"
              action={<SegmentedControl options={RADAR_MODE_OPTIONS} value={radarMode} onChange={setRadarMode} size="sm" />}
            >
              {isLoading || !data ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <RadarChart
                  data={data.radar}
                  axisKey="skill"
                  series={[
                    { dataKey: "current" as const, color: "#7C6CFF" },
                    ...(radarMode === "benchmark"
                      ? [{ dataKey: "benchmark" as const, color: "#F5B14C", isComparison: true }]
                      : []),
                  ]}
                  height={300}
                />
              )}
            </SectionCard>

            <SectionCard title="Skill Gaps" description="Ranked by priority — closing these moves your probability most">
              <div className="flex flex-col gap-2">
                {isLoading || !data
                  ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                  : data.gaps.map((gap) => {
                      const isExpanded = expandedGap === gap.id;
                      return (
                        <div key={gap.id} className="rounded-md border border-border-subtle bg-bg-elevated-2">
                          <button
                            type="button"
                            onClick={() => setExpandedGap(isExpanded ? null : gap.id)}
                            className="flex w-full items-center gap-4 px-4 py-3 text-left"
                          >
                            <div className="w-40 shrink-0">
                              <p className="text-sm font-medium text-text-primary">{gap.skill}</p>
                            </div>
                            <SkillBar label="" current={gap.current} target={gap.target} className="flex-1" />
                            <PriorityBadge level={gap.priority} />
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: DURATION.component, ease: EASE.expoOut }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-border-subtle px-4 py-3">
                                  <p className="text-sm text-text-secondary">{gap.suggestion}</p>
                                  <p className="mt-2 font-mono text-xs text-accent-ink">
                                    {gap.resource.label} · {gap.resource.provider}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
              </div>
            </SectionCard>
          </motion.div>
        )}

        {tab === "growth" && (
          <motion.div
            key="growth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.component, ease: EASE.symmetric }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SectionCard title="Recommended Projects">
                <div className="flex flex-col gap-3">
                  {isLoading || !data
                    ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[110px] w-full" />)
                    : data.projects.map((project) => (
                        <RecommendationCard
                          key={project.id}
                          title={project.title}
                          description={project.description}
                          impact={project.impact}
                          meta={
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span>~{project.estimatedWeeks} weeks ·</span>
                              {project.skillsGained.map((s) => (
                                <Chip key={s}>{s}</Chip>
                              ))}
                            </div>
                          }
                        />
                      ))}
                </div>
              </SectionCard>

              <SectionCard title="Recommended Certifications">
                <div className="flex flex-col gap-3">
                  {isLoading || !data
                    ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                    : data.certifications.map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between gap-3 rounded-sm border border-border-subtle bg-bg-elevated-2 px-3.5 py-3">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{cert.title}</p>
                            <p className="text-xs text-text-muted">{cert.provider} · ~{cert.durationWeeks} weeks</p>
                          </div>
                          <PriorityBadge level={cert.impact} />
                        </div>
                      ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Suggested Technologies" description="Based on your top company matches">
              <div className="flex flex-wrap gap-2">
                {isLoading || !data
                  ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-32" />)
                  : data.technologies.map((tech) => (
                      <Tooltip key={tech.id} content={tech.reason} wrap>
                        <Badge tone="accent" className="cursor-default px-3 py-1.5 text-sm">
                          {tech.name}
                        </Badge>
                      </Tooltip>
                    ))}
              </div>
            </SectionCard>

            <SectionCard title="Learning Path" description={data?.paths[0]?.description}>
              {isLoading || !data ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="flex flex-col gap-0">
                  {data.paths[0].steps.map((step, i) => (
                    <div key={step.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            step.status === "done"
                              ? "bg-success text-white"
                              : step.status === "in-progress"
                                ? "border-2 border-accent-solid text-accent-ink"
                                : "border border-border-subtle text-text-muted"
                          }`}
                        >
                          {step.status === "done" ? "✓" : i + 1}
                        </div>
                        {i < data.paths[0].steps.length - 1 && <div className="my-1 h-full min-h-6 w-px flex-1 bg-border-subtle" />}
                      </div>
                      <div className="pb-5">
                        <p className="text-sm font-medium text-text-primary">{step.title}</p>
                        <p className="text-xs text-text-muted">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Career Growth">
              <div className="flex flex-col gap-3">
                {isLoading || !data
                  ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                  : data.growth.map((rec) => (
                      <Card key={rec.id} surface="nested" padding="default" className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{rec.title}</p>
                          <p className="mt-1 text-xs text-text-secondary">{rec.description}</p>
                        </div>
                        <Chip className="shrink-0">{rec.horizon}</Chip>
                      </Card>
                    ))}
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
