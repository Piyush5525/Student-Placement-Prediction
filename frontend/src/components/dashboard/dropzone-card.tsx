import { useCallback, useRef, useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/lib/motion";

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M17 8l-5-5-5 5" />
    <path d="M12 3v12" />
  </svg>
);

interface DropzoneCardProps {
  accept?: string;
  onFileSelected: (file: File) => void;
  error?: string;
  className?: string;
}

/**
 * DropzoneCard — FRONTEND_ARCHITECTURE §6.9. Drag-and-drop upload target
 * with idle / drag-over / error visual states. No backend: selecting a
 * file hands it to the caller, which drives the mock upload→analysis flow.
 */
export function DropzoneCard({ accept = ".pdf,.doc,.docx", onFileSelected, error, className }: DropzoneCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors",
        error
          ? "border-danger/50 bg-danger/5"
          : dragOver
            ? "border-accent-ink bg-accent-soft"
            : "border-border-subtle bg-bg-elevated-2 hover:border-border-strong",
        className,
      )}
    >
      <motion.div
        animate={dragOver ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
        transition={{ duration: DURATION.micro, ease: EASE.expoOut }}
        className={cn("flex size-12 items-center justify-center rounded-full", dragOver ? "bg-accent-soft text-accent-ink" : "bg-bg-elevated-3 text-text-muted")}
      >
        <UploadIcon className="size-6" />
      </motion.div>
      <div>
        <p className="text-sm font-semibold text-text-primary">
          {dragOver ? "Drop to upload" : "Drag & drop your resume, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-text-muted">PDF, DOC, or DOCX — max 5MB</p>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
    </div>
  );
}
