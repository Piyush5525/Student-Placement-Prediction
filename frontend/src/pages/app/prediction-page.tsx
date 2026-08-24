import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, SectionCard, FactorBar } from "@/components/dashboard";
import { ScenarioSlider } from "@/components/dashboard";
import { ProbabilityGauge } from "@/components/charts";
import { Card } from "@/components/ui/card";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";
import { usePrediction, type PredictionScenario } from "@/hooks/use-prediction";
import { useProfile } from "@/hooks/use-profile";
import { mockPlacementStatus } from "@/mock/prediction";
import { DURATION, EASE } from "@/lib/motion";

const STATUS_TONE = { strong: "success", "on-track": "info", "at-risk": "warning" } as const;
const CONFIDENCE_TONE = { High: "success", Medium: "warning", Low: "danger" } as const;

/**
 * Placement Prediction Center — FRONTEND_ARCHITECTURE §6.5, reworked to
 * call the real trained model. POST /prediction now runs a scikit-learn
 * Gradient Boosting classifier trained on the placement dataset
 * (data/processed/cleaned_dataset.csv), so the form below collects exactly
 * the 11 features that model was trained on (see models/metadata.json
 * `feature_order`) — nothing invented, nothing extra. The previous "coding
 * score / internship count" What-If sliders didn't correspond to any real
 * model input, so they've been replaced with the model's actual fields.
 *
 * Defaults are seeded from the student's profile where a direct match
 * exists (CGPA, backlogs); everything else the model needs but the profile
 * doesn't track (12th/10th %, Skills, Workshops/Certifications, etc.)
 * starts at the dataset average so the gauge shows a sensible baseline
 * before the student adjusts anything.
 */
export function PredictionPage() {
  const { data, isLoading, error, fetchBaseline, predict } = usePrediction();
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  const baseline: PredictionScenario = useMemo(
    () => ({
      cgpa: profile?.cgpa ?? 7.7,
      major_projects: 1,
      workshops_certifications: 2,
      mini_projects: 1,
      skills: 8,
      communication_skill_rating: 4.3,
      twelfth_percentage: 70,
      tenth_percentage: 75,
      backlogs: profile?.backlogs ?? 2,
      internship: "Yes",
      hackathon: "Yes",
    }),
    [profile],
  );

  const [inputs, setInputs] = useState<PredictionScenario>(baseline);
  const [projected, setProjected] = useState<number | undefined>(undefined);
  const [isSimulating, setIsSimulating] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  // Wait for the profile fetch to settle (success or failure) before
  // seeding the form and firing the first real prediction — otherwise this
  // would fire once with the pre-profile fallback defaults and never again,
  // since usePrediction() has no automatic re-fetch.
  useEffect(() => {
    if (isProfileLoading) return;
    setInputs(baseline);
    if (!initializedRef.current) {
      initializedRef.current = true;
      void fetchBaseline(baseline);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseline, isProfileLoading]);

  const hasChanges = useMemo(
    () => JSON.stringify(inputs) !== JSON.stringify(baseline),
    [inputs, baseline],
  );

  // Debounced call to POST /prediction with the edited form — waits 400ms
  // after the last change before firing, so dragging a slider doesn't spam
  // the backend.
  useEffect(() => {
    if (!hasChanges) {
      setProjected(undefined);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setIsSimulating(true);
      predict(inputs)
        .then((result) => setProjected(result.placement_probability))
        .catch(() => setProjected(undefined))
        .finally(() => setIsSimulating(false));
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [inputs, hasChanges, predict]);

  const delta =
    projected !== undefined && data ? Math.round(projected - data.placement_probability) : 0;
  const maxAbsImpact = data ? Math.max(...data.factors.map((f) => Math.abs(f.impact))) : 1;
  const isPlaced = data?.prediction === "Placed";

  if (error && !data) {
    return (
      <div>
        <PageHeader
          title="Placement Prediction"
          description="Based on the trained placement model's 11 input features."
        />
        <ErrorState description={error} onRetry={() => fetchBaseline(inputs)} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Placement Prediction"
        description="Based on the trained placement model's 11 input features."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Result hero */}
        <div className="lg:col-span-7">
          <Card padding="hero" className="flex h-full flex-col items-center justify-center gap-4 text-center">
            {isLoading || !data ? (
              <Skeleton className="size-[200px] rounded-full" />
            ) : (
              <ProbabilityGauge
                value={data.placement_probability}
                projectedValue={hasChanges && projected !== undefined ? projected : undefined}
                size="lg"
              />
            )}
            <div>
              <p className="text-xl font-display font-semibold text-text-primary">
                {data ? `You have a ${data.verdict.toLowerCase()}` : "Loading your prediction…"}
              </p>
              {data && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <Badge tone={isPlaced ? "success" : "danger"}>
                    {isPlaced ? "PLACED" : "NOT PLACED"}
                  </Badge>
                  <Badge tone={CONFIDENCE_TONE[data.confidence]}>
                    {data.confidence} confidence
                  </Badge>
                </div>
              )}
              {data && (
                <p className="mt-2 text-sm text-text-secondary">
                  Placement probability {data.placement_probability.toFixed(2)}% · Not placed{" "}
                  {data.not_placed_probability.toFixed(2)}%
                </p>
              )}
            </div>
            {hasChanges && projected !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.component, ease: EASE.expoOut }}
                className={`rounded-full border px-4 py-1.5 font-mono text-xs font-semibold ${
                  delta >= 0 ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"
                }`}
              >
                {delta >= 0 ? "+" : ""}
                {delta}% with this scenario
              </motion.div>
            )}
          </Card>
        </div>

        {/* Factor breakdown */}
        <div className="lg:col-span-5">
          <SectionCard title="What's driving this" description="Top contributing factors, ranked by impact">
            <div className="flex flex-col gap-3">
              {isLoading || !data
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
                : data.factors.map((factor) => (
                    <FactorBar
                      key={factor.label}
                      label={factor.label}
                      impact={factor.impact}
                      explanation={factor.explanation}
                      maxAbsImpact={maxAbsImpact}
                    />
                  ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* What-If Simulator — the model's real 11 input features */}
      <div className="mt-4">
        <SectionCard
          title="What-If Simulator"
          description="Adjust your profile to see the projected impact on your placement probability"
          action={
            hasChanges && (
              <button
                type="button"
                onClick={() => setInputs(baseline)}
                className="text-xs font-medium text-accent-ink hover:underline"
              >
                Reset
              </button>
            )
          }
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <ScenarioSlider
              label="CGPA"
              value={inputs.cgpa}
              min={5}
              max={10}
              step={0.1}
              formatValue={(v) => v.toFixed(1)}
              onChange={(v) => setInputs((s) => ({ ...s, cgpa: v }))}
            />
            <ScenarioSlider
              label="Backlogs"
              value={inputs.backlogs}
              min={0}
              max={10}
              onChange={(v) => setInputs((s) => ({ ...s, backlogs: v }))}
            />
            <ScenarioSlider
              label="Major Projects"
              value={inputs.major_projects}
              min={0}
              max={5}
              onChange={(v) => setInputs((s) => ({ ...s, major_projects: v }))}
            />
            <ScenarioSlider
              label="Mini Projects"
              value={inputs.mini_projects}
              min={0}
              max={5}
              onChange={(v) => setInputs((s) => ({ ...s, mini_projects: v }))}
            />
            <ScenarioSlider
              label="Workshops / Certifications"
              value={inputs.workshops_certifications}
              min={0}
              max={10}
              onChange={(v) => setInputs((s) => ({ ...s, workshops_certifications: v }))}
            />
            <ScenarioSlider
              label="Skills Score"
              value={inputs.skills}
              min={0}
              max={10}
              onChange={(v) => setInputs((s) => ({ ...s, skills: v }))}
            />
            <ScenarioSlider
              label="Communication Skill Rating"
              value={inputs.communication_skill_rating}
              min={0}
              max={5}
              step={0.1}
              formatValue={(v) => v.toFixed(1)}
              onChange={(v) => setInputs((s) => ({ ...s, communication_skill_rating: v }))}
            />
            <ScenarioSlider
              label="12th Percentage"
              value={inputs.twelfth_percentage}
              min={40}
              max={100}
              formatValue={(v) => `${v}%`}
              onChange={(v) => setInputs((s) => ({ ...s, twelfth_percentage: v }))}
            />
            <ScenarioSlider
              label="10th Percentage"
              value={inputs.tenth_percentage}
              min={40}
              max={100}
              formatValue={(v) => `${v}%`}
              onChange={(v) => setInputs((s) => ({ ...s, tenth_percentage: v }))}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-sm border border-border-subtle bg-bg-elevated-2 px-3.5 py-2.5">
              <span className="text-sm text-text-secondary">Internship experience</span>
              <ToggleSwitch
                label="Internship experience"
                checked={inputs.internship === "Yes"}
                onChange={(checked) =>
                  setInputs((s) => ({ ...s, internship: checked ? "Yes" : "No" }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-sm border border-border-subtle bg-bg-elevated-2 px-3.5 py-2.5">
              <span className="text-sm text-text-secondary">Hackathon participation</span>
              <ToggleSwitch
                label="Hackathon participation"
                checked={inputs.hackathon === "Yes"}
                onChange={(checked) =>
                  setInputs((s) => ({ ...s, hackathon: checked ? "Yes" : "No" }))
                }
              />
            </div>
          </div>

          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.component, ease: EASE.expoOut }}
              className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent-soft bg-accent-soft/40 px-4 py-3"
            >
              <p className="text-sm text-text-secondary">
                Projected probability:{" "}
                <span className="font-semibold text-accent-ink">
                  {isSimulating ? "…" : projected !== undefined ? `${projected.toFixed(2)}%` : "—"}
                </span>
                {projected !== undefined && !isSimulating && (
                  <>
                    {" "}
                    ({delta >= 0 ? "+" : ""}
                    {delta}% from current)
                  </>
                )}
              </p>
            </motion.div>
          )}
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Placement Status">
          <div className="flex flex-col gap-3">
            {mockPlacementStatus.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-sm border border-border-subtle bg-bg-elevated-2 px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.note}</p>
                </div>
                <Badge tone={STATUS_TONE[item.status]}>{item.status.replace("-", " ")}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
