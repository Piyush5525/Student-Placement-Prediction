import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Shimmer skeleton — DESIGN_SYSTEM §08. Every async widget in the app uses
 * this (sized to its exact final layout) rather than a spinner, per
 * FRONTEND_ARCHITECTURE §7's "no layout shift on data arrival" rule.
 * Consumers pass explicit width/height (or full className) to match the
 * real content's dimensions.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-sm bg-bg-elevated-2 bg-[linear-gradient(90deg,transparent,rgba(124,108,255,0.08),transparent)] bg-[length:200%_100%] animate-shimmer",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
