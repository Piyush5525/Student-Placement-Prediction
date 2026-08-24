import { forwardRef, useId, useState } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/lib/motion";

interface TextInputProps extends Omit<HTMLMotionProps<"input">, "size"> {
  label: string;
  error?: string;
  hint?: string;
}

/**
 * TextInput — FRONTEND_ARCHITECTURE §6.2 auth-page spec. Floating label
 * pattern, error surfaces inline immediately beneath the field (never
 * batched at the top), shake micro-animation when `error` is set on an
 * already-touched field.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm text-text-secondary">
          {label}
        </label>
        <motion.input
          ref={ref}
          id={inputId}
          animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: DURATION.component, ease: EASE.symmetric }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            "rounded-md border bg-bg-elevated-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-accent-soft",
            error ? "border-danger focus:border-danger" : "border-border-subtle focus:border-accent-ink",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61C3.35 8.36 1 12 1 12s4 8 11 8a9.26 9.26 0 0 0 5.39-1.61M1 1l22 22" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </svg>
);

/**
 * PasswordInput — TextInput plus a show/hide toggle, per §6.2. Toggle is
 * icon-only and doesn't shift layout when it appears/disappears.
 */
export const PasswordInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm text-text-secondary">
          {label}
        </label>
        <div className="relative">
          <motion.input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: DURATION.component, ease: EASE.symmetric }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "w-full rounded-md border bg-bg-elevated-2 px-4 py-2.5 pr-11 text-sm text-text-primary placeholder:text-text-muted",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-accent-soft",
              error ? "border-danger focus:border-danger" : "border-border-subtle focus:border-accent-ink",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
