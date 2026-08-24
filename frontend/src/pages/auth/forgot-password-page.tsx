import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { AuthLayout } from "@/layouts/auth-layout";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { crossFadeVariants } from "@/lib/motion";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

const MailCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
    <path d="m2 7 9.4 6.1a2 2 0 0 0 2.2 0L18 9" />
    <path d="m16 4 2 2 4-4" />
  </svg>
);

/**
 * Forgot Password — FRONTEND_ARCHITECTURE §6.2: "dedicated page → success
 * state ('check your email') replaces form in place (AnimatePresence
 * cross-fade, not a route jump)." No backend — submit simulates the
 * request and swaps to the success panel.
 */
export function ForgotPasswordPage() {
  const [sent, setSent] = useState<{ email: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  function onSubmit(values: FormValues) {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSent({ email: values.email });
    }, 700);
  }

  return (
    <AuthLayout
      switchPrompt={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-accent-ink hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="success"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={crossFadeVariants}
            className="flex flex-col items-center gap-3 py-4 text-center"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
              <MailCheckIcon className="size-6" />
            </div>
            <h2 className="text-lg font-display font-semibold text-text-primary">Check your email</h2>
            <p className="max-w-xs text-sm text-text-secondary">
              We sent a password reset link to <span className="text-text-primary">{sent.email}</span>. It expires in 15 minutes.
            </p>
            <Button variant="ghost" size="sm" onClick={() => setSent(null)} className="mt-2">
              Use a different email
            </Button>
          </motion.div>
        ) : (
          <motion.div key="form" initial="initial" animate="animate" exit="exit" variants={crossFadeVariants}>
            <h2 className="text-xl font-display font-semibold text-text-primary">Reset your password</h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              Enter the email tied to your account — we'll send a reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 flex flex-col gap-5">
              <TextInput
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@college.edu"
                error={errors.email?.message}
                {...register("email")}
              />
              <Button type="submit" variant="primary" size="lg" isLoading={submitting} className="w-full">
                Send reset link
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
