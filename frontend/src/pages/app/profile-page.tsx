import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader, SectionCard, InlineEditField } from "@/components/dashboard";
import { ProbabilityGauge } from "@/components/charts";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";
import { useProfile } from "@/hooks/use-profile";
import type { ProfileUpdatePayload } from "@/hooks/use-profile";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Profile — FRONTEND_ARCHITECTURE §6.13. Identity card (sticky, left) +
 * sectioned editable fields (right), grouped exactly per the dataset
 * schema: Academic / Experience / Skills & Scores / Presence / Wellbeing.
 * Click-to-edit throughout. Wired to real GET/PUT /profile — each
 * InlineEditField commits its own field immediately via PUT with a
 * single-key patch (matching the backend's partial-patch contract), then
 * the "unsaved changes" bar is repurposed as a brief save confirmation.
 */
export function ProfilePage() {
  const { data, isLoading, error, refetch, updateProfile } = useProfile();
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleFieldSave(patch: ProfileUpdatePayload) {
    try {
      await updateProfile(patch);
      setDirty(true);
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save that change.");
    }
  }

  if (error && !data) {
    return (
      <div>
        <PageHeader title="Profile" description="Keep your profile current — every model prediction is derived from it." />
        <ErrorState description={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Profile" description="Keep your profile current — every model prediction is derived from it." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Identity card */}
        <div className="lg:col-span-4">
          <SectionCard className="lg:sticky lg:top-6">
            <div className="flex flex-col items-center gap-4 text-center">
              {isLoading || !data ? (
                <>
                  <Skeleton className="size-16 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </>
              ) : (
                <>
                  <Avatar name={data.name} size="lg" />
                  <div>
                    <p className="text-md font-semibold text-text-primary">{data.name}</p>
                    <p className="text-xs text-text-muted">{data.email}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <Chip>{data.college_tier}</Chip>
                    <Chip>{data.branch}</Chip>
                    <Chip>Batch {data.batch_year}</Chip>
                  </div>
                  <div className="mt-2 flex flex-col items-center gap-1.5">
                    <ProbabilityGauge value={data.profile_completeness} size="sm" tone="neutral" suffix="%" />
                    <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Profile Completeness</p>
                  </div>
                  <p className="text-xs text-text-muted">Member since {data.member_since}</p>
                </>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Editable sections */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          <SectionCard title="Academic">
            {isLoading || !data ? (
              <SectionSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                <InlineEditField
                  label="CGPA"
                  value={data.cgpa.toFixed(2)}
                  onSave={(v) => handleFieldSave({ cgpa: Number(v) })}
                  affectsPredictions
                />
                <InlineEditField
                  label="Branch"
                  value={data.branch}
                  onSave={(v) => handleFieldSave({ branch: v })}
                  affectsPredictions
                />
                <InlineEditField
                  label="College Tier"
                  value={data.college_tier}
                  onSave={(v) => handleFieldSave({ college_tier: v })}
                  affectsPredictions
                />
                <InlineEditField
                  label="Backlogs"
                  value={String(data.backlogs)}
                  onSave={(v) => handleFieldSave({ backlogs: Number(v) })}
                  affectsPredictions
                />
                <InlineEditField
                  label="Attendance"
                  value={String(data.attendance_percentage)}
                  suffix="%"
                  onSave={(v) => handleFieldSave({ attendance_percentage: Number(v) })}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard title="Experience">
            {isLoading || !data ? (
              <SectionSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                <InlineEditField
                  label="Internships"
                  value={String(data.internships_count)}
                  onSave={(v) => handleFieldSave({ internships_count: Number(v) })}
                  affectsPredictions
                />
                <InlineEditField
                  label="Projects"
                  value={String(data.projects_count)}
                  onSave={(v) => handleFieldSave({ projects_count: Number(v) })}
                  affectsPredictions
                />
                <InlineEditField
                  label="Certifications"
                  value={String(data.certifications_count)}
                  onSave={(v) => handleFieldSave({ certifications_count: Number(v) })}
                  affectsPredictions
                />
                <InlineEditField
                  label="Hackathons"
                  value={String(data.hackathons_participated)}
                  onSave={(v) => handleFieldSave({ hackathons_participated: Number(v) })}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard title="Skills & Scores" description="Scores marked AI-assessed are derived, not self-reported">
            {isLoading || !data ? (
              <SectionSkeleton count={5} />
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                <ReadonlyField label="Coding Score" value={data.coding_skill_score} />
                <ReadonlyField label="Aptitude Score" value={data.aptitude_score} />
                <ReadonlyField label="Communication Score" value={data.communication_skill_score} />
                <ReadonlyField label="Logical Reasoning" value={data.logical_reasoning_score} />
                <ReadonlyField label="Mock Interview Score" value={data.mock_interview_score} />
              </div>
            )}
          </SectionCard>

          <SectionCard title="Presence">
            {isLoading || !data ? (
              <SectionSkeleton count={2} />
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                <InlineEditField
                  label="GitHub Repos"
                  value={String(data.github_repos)}
                  onSave={(v) => handleFieldSave({ github_repos: Number(v) })}
                />
                <InlineEditField
                  label="LinkedIn Connections"
                  value={String(data.linkedin_connections)}
                  onSave={(v) => handleFieldSave({ linkedin_connections: Number(v) })}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard title="Wellbeing & Activities">
            {isLoading || !data ? (
              <SectionSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                <InlineEditField
                  label="Sleep Hours"
                  value={data.sleep_hours.toFixed(1)}
                  suffix="h/night"
                  onSave={(v) => handleFieldSave({ sleep_hours: Number(v) })}
                />
                <InlineEditField
                  label="Study Hours"
                  value={data.study_hours_per_day.toFixed(1)}
                  suffix="h/day"
                  onSave={(v) => handleFieldSave({ study_hours_per_day: Number(v) })}
                />
                <ReadonlyField label="Extracurricular Score" value={data.extracurricular_score} />
                <ReadonlyField label="Leadership Score" value={data.leadership_score} />
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <AnimatePresence>
        {(dirty || saveError) && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: DURATION.page, ease: EASE.expoOut }}
            className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-6"
          >
            <div className="flex items-center gap-4 rounded-full border border-border-strong bg-bg-elevated px-5 py-3 shadow-card-hover">
              <span className={saveError ? "text-sm text-danger" : "text-sm text-text-secondary"}>
                {saveError ?? "Changes saved"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDirty(false);
                  setSaveError(null);
                }}
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-text-muted">{label}</span>
        <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-semibold text-accent-ink">AI</span>
      </div>
      <span className="text-sm text-text-primary">{value}/100</span>
    </div>
  );
}

function SectionSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
