import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

interface StateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

/**
 * EmptyState — DESIGN_SYSTEM §08. Centered, simple line-art icon (never a
 * stock illustration), one specific CTA. Always paired with a next action
 * per FRONTEND_ARCHITECTURE §7 — never a dead end.
 */
export function EmptyState({ icon, title, description, action, className }: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border-subtle px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <div className="text-text-muted [&_svg]:size-10 [&_svg]:stroke-[1.5]">{icon}</div>}
      <p className="text-md font-semibold text-text-primary">{title}</p>
      {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * ErrorState — same layout as EmptyState, danger-tinted, always offers Retry.
 * Never a raw error message per FRONTEND_ARCHITECTURE §7.
 */
export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-danger/30 px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-md font-semibold text-danger">{title}</p>
      {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
          Retry
        </Button>
      )}
    </div>
  );
}
