import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  PageHeader,
  SectionCard,
  DropzoneCard,
  UploadProgressRing,
  KeywordChip,
  ComparisonTable,
} from "@/components/dashboard";
import { ProbabilityGauge } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ErrorState } from "@/components/ui/empty-state";
import { useResume } from "@/hooks/use-resume";
import { DURATION, EASE } from "@/lib/motion";

type Stage = "empty" | "uploading" | "extracting" | "analyzing" | "done" | "error";

const STAGE_LABEL: Record<"uploading" | "extracting" | "analyzing", string> = {
  uploading: "Uploading",
  extracting: "Extracting text",
  analyzing: "Analyzing against ATS rules",
};

const STAGE_ORDER: ("uploading" | "extracting" | "analyzing")[] = ["uploading", "extracting", "analyzing"];

/**
 * Resume Analyzer — FRONTEND_ARCHITECTURE §6.9. Diagnosis-before-
 * prescription shape: ATS score hero → keyword feedback → structural
 * comparison table → version history. Reuses ProbabilityGauge relabeled
 * for ATS score, per §6.9's explicit "same visual device" rule.
 *
 * Wired to the real backend: file selection triggers a genuine
 * POST /resume/upload (multipart/form-data); once that succeeds, the
 * staged "extracting/analyzing" visual is a short, honest UI progression
 * before showing the real GET /resume analysis (which the backend
 * documents as a static mock analysis, not derived from the uploaded
 * file — that's a backend contract detail, not something the frontend
 * fakes).
 */
export function ResumePage() {
  const [stage, setStage] = useState<Stage>("empty");
  const [fileName, setFileName] = useState("");
  const [compareMode, setCompareMode] = useState<"benchmark" | "previous">("benchmark");
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  const { data, isLoading: isAnalysisLoading, error: analysisError, refetch, upload, isUploading } = useResume();

  async function handleFileSelected(file: File) {
    setFileName(file.name);
    setUploadErrorMsg(null);
    setStage("uploading");
    try {
      await upload(file);
      setStage("extracting");
    } catch (err) {
      setUploadErrorMsg(err instanceof Error ? err.message : "Upload failed.");
      setStage("error");
    }
  }

  // Short, honest staged visual (extracting → analyzing) after a real
  // upload succeeds, then reveal the real analysis once it's loaded.
  useEffect(() => {
    if (stage !== "extracting" && stage !== "analyzing") return;
    const index = STAGE_ORDER.indexOf(stage as "extracting" | "analyzing");
    const timer = setTimeout(() => {
      if (index === STAGE_ORDER.length - 1) {
        void refetch().then(() => setStage("done"));
      } else {
        setStage(STAGE_ORDER[index + 1]);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [stage, refetch]);

  if (!data && stage === "empty" && !isAnalysisLoading && analysisError) {
    // Initial GET /resume failed before any upload attempt — show a retry
    // state instead of silently rendering the empty dropzone forever.
  }

  const matched = data?.keywords.filter((k) => k.severity === "matched") ?? [];
  const missing = data?.keywords.filter((k) => k.severity === "missing") ?? [];
  const weak = data?.keywords.filter((k) => k.severity === "weak") ?? [];

  return (
    <div>
      <PageHeader
        title="Resume Analyzer"
        description="ATS score, missing keywords, and a structural audit against what recruiting systems expect."
      />

      {stage === "empty" && (
        <SectionCard>
          <DropzoneCard onFileSelected={handleFileSelected} />
        </SectionCard>
      )}

      {stage === "error" && (
        <SectionCard>
          <ErrorState
            title="Upload failed"
            description={uploadErrorMsg ?? "Something went wrong uploading your resume."}
            onRetry={() => setStage("empty")}
          />
        </SectionCard>
      )}

      {(stage === "uploading" || stage === "extracting" || stage === "analyzing") && (
        <SectionCard>
          <div className="flex flex-col items-center gap-6 py-10">
            <UploadProgressRing progress={undefined} label={`${stage === "uploading" ? "Uploading" : STAGE_LABEL[stage]} — ${fileName}`} />
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
              {isUploading ? "Uploading to server…" : STAGE_ORDER.map((s, i) => (
                <span key={s} className={s === stage ? "text-accent-ink" : ""}>
                  {STAGE_LABEL[s]}
                  {i < STAGE_ORDER.length - 1 && " → "}
                </span>
              ))}
            </p>
          </div>
        </SectionCard>
      )}

      {stage === "done" && !data && (
        <SectionCard>
          <ErrorState
            title="Couldn't load analysis"
            description={analysisError ?? "Something went wrong."}
            onRetry={refetch}
          />
        </SectionCard>
      )}

      {stage === "done" && data && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.page, ease: EASE.expoOut }}
            className="flex flex-col gap-4"
          >
            {/* ATS Score hero */}
            <SectionCard>
              <div className="flex flex-col items-center gap-4 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <ProbabilityGauge value={data.ats_score} size="md" label="ATS SCORE" />
                  <div>
                    <p className="text-md font-semibold text-text-primary">{fileName}</p>
                    <p className="mt-1 max-w-sm text-sm text-text-secondary">{data.ats_verdict}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStage("empty")}>
                  Upload a different resume
                </Button>
              </div>
            </SectionCard>

            {/* Keyword feedback */}
            <SectionCard title="Keyword Match" description={`${matched.length} matched · ${weak.length} weak · ${missing.length} missing`}>
              <div className="flex flex-wrap gap-2">
                {data.keywords.map((k) => (
                  <KeywordChip key={k.id} keyword={k.keyword} severity={k.severity} section={k.section} />
                ))}
              </div>
            </SectionCard>

            {/* Structural comparison */}
            <SectionCard
              title="Structural Audit"
              description="Section-by-section comparison against what ATS systems expect"
              bodyPadded={false}
              action={
                <SegmentedControl
                  size="sm"
                  options={[
                    { label: "vs. ATS benchmark", value: "benchmark" },
                    { label: "vs. previous upload", value: "previous" },
                  ]}
                  value={compareMode}
                  onChange={setCompareMode}
                />
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={compareMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.component, ease: EASE.symmetric }}
                >
                  <ComparisonTable
                    rows={data.section_audit.map((row) => ({
                      id: row.id,
                      section: row.section,
                      status: row.status as "present" | "weak" | "missing",
                      yourResume: row.your_resume,
                      expected: row.expected,
                    }))}
                    rightColumnLabel={compareMode === "benchmark" ? "What ATS systems expect" : "Previous upload"}
                  />
                </motion.div>
              </AnimatePresence>
            </SectionCard>

            {/* Version history */}
            <SectionCard title="Version History">
              <div className="flex flex-col gap-2">
                {data.versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-md border border-border-subtle px-3.5 py-2.5"
                  >
                    <div>
                      <p className="text-sm text-text-primary">{v.label}</p>
                      <p className="font-mono text-xs text-text-muted">{v.uploaded_at}</p>
                    </div>
                    <Chip>{v.ats_score}/100</Chip>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-text-secondary">Ready to practice? Put this score to work.</p>
                <Link to="/app/interview">
                  <Button variant="primary" size="sm">
                    Start interview prep →
                  </Button>
                </Link>
              </div>
            </SectionCard>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
