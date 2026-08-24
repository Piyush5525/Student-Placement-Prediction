import { cn } from "@/lib/cn";
import type { ResumeSectionAudit, SectionStatus } from "@/mock/resume";

const STATUS_ICON: Record<SectionStatus, string> = { present: "✓", weak: "!", missing: "✕" };
const STATUS_CLASS: Record<SectionStatus, string> = {
  present: "bg-success/12 text-success",
  weak: "bg-warning/12 text-warning",
  missing: "bg-danger/12 text-danger",
};

interface ComparisonTableProps {
  rows: ResumeSectionAudit[];
  rightColumnLabel?: string;
}

/**
 * ComparisonTable — FRONTEND_ARCHITECTURE §6.9: structural audit, not a
 * literal text diff. Rows = resume sections, columns = "Your Resume"
 * (status icon) vs. "What ATS systems expect" (or a previous-upload
 * comparison, via `rightColumnLabel`).
 */
export function ComparisonTable({ rows, rightColumnLabel = "What ATS systems expect" }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-xs uppercase tracking-wider text-text-muted">
            <th className="px-4 py-3 font-mono font-normal">Section</th>
            <th className="px-4 py-3 font-mono font-normal">Your Resume</th>
            <th className="px-4 py-3 font-mono font-normal">{rightColumnLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border-subtle/60">
              <td className="px-4 py-3 font-semibold text-text-primary">{row.section}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold", STATUS_CLASS[row.status])}>
                    {STATUS_ICON[row.status]}
                  </span>
                  <span className="text-text-secondary">{row.yourResume}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-text-muted">{row.expected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
