import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

interface SectionCardProps {
  /** Omit entirely (rather than passing "") for a headerless card — e.g. Profile's identity panel. */
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Card padding — "none" when the child manages its own internal spacing (e.g. a table). */
  bodyPadded?: boolean;
}

/** Standard module container — title/description/action header + body, used for every dashboard/analytics panel. */
export function SectionCard({ title, description, action, children, className, bodyPadded = true }: SectionCardProps) {
  const hasHeader = Boolean(title || description || action);
  return (
    <Card padding={bodyPadded ? "default" : "compact"} className={cn("flex h-full flex-col", className)}>
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-md font-semibold text-text-primary">{title}</h2>}
            {description && <p className="mt-1 text-xs text-text-secondary">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("flex-1", bodyPadded && hasHeader && "mt-4")}>{children}</div>
    </Card>
  );
}
