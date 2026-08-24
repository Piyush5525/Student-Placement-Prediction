import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { ScenarioSlider } from "@/components/dashboard";
import { StepProgress } from "@/components/onboarding/step-progress";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/context/auth-context";
import type { PredictionScenario } from "@/hooks/use-prediction";
import { DURATION, EASE, stepVariants } from "@/lib/motion";

const STEPS = ["Academics", "Skills & Projects", "Experience"];

const DEFAULTS: PredictionScenario = {
  cgpa: 7.7,
  twelfth_percentage: 70,
  tenth_percentage: 75,
  backlogs: 2,
  major_projects: 1,
  mini_projects: 1,
  workshops_certifications: 2,
  skills: 8,
  communication_skill_rating: 4.3,
  internship: "Yes",
  hackathon: "Yes",
};

/**
 * First-time student onboarding — collects exactly the 11 features the
 * trained placement model needs (see models/metadata.json `feature_order`),
 * grouped into 3 steps. Submitting the final step calls POST /onboarding,
 * which writes these fields to the profile, marks the account onboarded,
 * and runs the student's first real prediction — then this page routes to
 * the new dashboard to show the result.
 */
export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [values, setValues] = useState<PredictionScenario>(DEFAULTS);
  const { submit, isSubmitting, error } = useOnboarding();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  function update<K extends keyof PredictionScenario>(key: K, value: PredictionScenario[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function goNext() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    await submit(values);
    await refreshUser(); // picks up onboarding_complete: true so ProtectedRoute stops redirecting here
    navigate("/app/dashboard", { replace: true });
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="flex min-h-screen flex-col items-center bg-bg-base px-4 py-10 text-text-primary">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <span className="font-display text-sm font-semibold text-text-primary">
            Placement<span className="text-accent-ink">AI</span>
          </span>
          <h1 className="mt-4 text-2xl font-display font-semibold">Let's build your placement prediction</h1>
          <p className="mt-2 text-sm text-text-secondary">
            A few details about your academics and experience — this is exactly what the prediction model uses.
          </p>
        </div>

        <StepProgress steps={STEPS} currentStep={step} className="mb-8" />

        <Card padding="hero" className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants(direction)}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {step === 0 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg font-semibold">Academic Information</h2>
                  <ScenarioSlider
                    label="CGPA"
                    value={values.cgpa}
                    min={5}
                    max={10}
                    step={0.1}
                    formatValue={(v) => v.toFixed(1)}
                    onChange={(v) => update("cgpa", v)}
                  />
                  <ScenarioSlider
                    label="10th Percentage"
                    value={values.tenth_percentage}
                    min={40}
                    max={100}
                    formatValue={(v) => `${v}%`}
                    onChange={(v) => update("tenth_percentage", v)}
                  />
                  <ScenarioSlider
                    label="12th Percentage"
                    value={values.twelfth_percentage}
                    min={40}
                    max={100}
                    formatValue={(v) => `${v}%`}
                    onChange={(v) => update("twelfth_percentage", v)}
                  />
                  <ScenarioSlider
                    label="Active Backlogs"
                    value={values.backlogs}
                    min={0}
                    max={10}
                    onChange={(v) => update("backlogs", v)}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg font-semibold">Skills &amp; Projects</h2>
                  <ScenarioSlider
                    label="Major Projects"
                    value={values.major_projects}
                    min={0}
                    max={5}
                    onChange={(v) => update("major_projects", v)}
                  />
                  <ScenarioSlider
                    label="Mini Projects"
                    value={values.mini_projects}
                    min={0}
                    max={5}
                    onChange={(v) => update("mini_projects", v)}
                  />
                  <ScenarioSlider
                    label="Workshops / Certifications"
                    value={values.workshops_certifications}
                    min={0}
                    max={10}
                    onChange={(v) => update("workshops_certifications", v)}
                  />
                  <ScenarioSlider
                    label="Skills Score"
                    value={values.skills}
                    min={0}
                    max={10}
                    onChange={(v) => update("skills", v)}
                  />
                  <ScenarioSlider
                    label="Communication Skill Rating"
                    value={values.communication_skill_rating}
                    min={0}
                    max={5}
                    step={0.1}
                    formatValue={(v) => v.toFixed(1)}
                    onChange={(v) => update("communication_skill_rating", v)}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg font-semibold">Experience</h2>
                  <div className="flex items-center justify-between rounded-sm border border-border-subtle bg-bg-elevated-2 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Internship experience</p>
                      <p className="text-xs text-text-muted">Have you completed at least one internship?</p>
                    </div>
                    <ToggleSwitch
                      label="Internship experience"
                      checked={values.internship === "Yes"}
                      onChange={(checked) => update("internship", checked ? "Yes" : "No")}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-sm border border-border-subtle bg-bg-elevated-2 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Hackathon participation</p>
                      <p className="text-xs text-text-muted">Have you participated in a hackathon?</p>
                    </div>
                    <ToggleSwitch
                      label="Hackathon participation"
                      checked={values.hackathon === "Yes"}
                      onChange={(checked) => update("hackathon", checked ? "Yes" : "No")}
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: DURATION.component, ease: EASE.symmetric }}
                      className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={goBack} disabled={step === 0 || isSubmitting}>
              Back
            </Button>
            <span className="text-xs font-mono text-text-muted">
              Step {step + 1} of {STEPS.length}
            </span>
            {isLastStep ? (
              <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
                See my prediction
              </Button>
            ) : (
              <Button variant="primary" onClick={goNext}>
                Next
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
