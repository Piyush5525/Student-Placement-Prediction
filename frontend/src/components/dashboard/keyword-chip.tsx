import { cn } from "@/lib/cn";
import type { KeywordSeverity } from "@/mock/resume";

const SEVERITY_CLASS: Record<KeywordSeverity, string> = {
  matched: "border-success/30 bg-success/10 text-success",
  weak: "border-warning/30 bg-warning/10 text-warning",
  missing: "border-danger/30 bg-danger/10 text-danger",
};

const SEVERITY_LABEL: Record<KeywordSeverity, string> = {
  matched: "Matched",
  weak: "Weak",
  missing: "Missing",
};

/** KeywordChip — FRONTEND_ARCHITECTURE §6.9: severity-colored chip for ATS keyword matches. */
export function KeywordChip({ keyword, severity, section }: { keyword: string; severity: KeywordSeverity; section: string }) {
  return (
    <span
      title={`${SEVERITY_LABEL[severity]} · expected in ${section}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs",
        SEVERITY_CLASS[severity],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {keyword}
    </span>
  );
}
