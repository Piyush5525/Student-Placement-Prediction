import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface InlineEditFieldProps {
  label: string;
  value: string;
  suffix?: string;
  onSave: (value: string) => void;
  /** Fields that feed the model surface a small note when edited — Profile §6.13. */
  affectsPredictions?: boolean;
}

/** Click-to-edit field — DESIGN_SYSTEM §08: click reveals inline input, Enter/blur commits, Escape cancels. */
export function InlineEditField({ label, value, suffix, onSave, affectsPredictions }: InlineEditFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-xs uppercase tracking-wider text-text-muted">{label}</span>
      {editing ? (
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          className="rounded-sm border border-accent-ink bg-bg-elevated-3 px-2.5 py-1.5 text-sm text-text-primary focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={cn(
            "w-fit border-b border-dashed border-transparent text-left text-sm text-text-primary transition-colors",
            "hover:border-border-strong",
          )}
        >
          {value}
          {suffix && <span className="text-text-muted"> {suffix}</span>}
        </button>
      )}
      {affectsPredictions && editing && (
        <span className="text-[11px] text-warning">Saving this will affect your predictions</span>
      )}
    </div>
  );
}
