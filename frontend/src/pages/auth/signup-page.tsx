import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { AuthLayout } from "@/layouts/auth-layout";
import { TextInput, PasswordInput } from "@/components/ui/text-input";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import { Button } from "@/components/ui/button";
import { SocialAuthButton, Divider } from "@/components/ui/social-auth-button";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-client";
import { redirectToGoogleConsent } from "@/lib/google-oauth";
import { DURATION, EASE } from "@/lib/motion";

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * Signup — FRONTEND_ARCHITECTURE §6.2, now wired to the real backend via
 * AuthProvider (src/context/auth-context.tsx). Routes to /app/dashboard on
 * success — §6.2 originally specified /onboarding, but that page was never
 * built (still a RouteStub), so new signups land where every other
 * authenticated flow does instead of hitting a dead end. Field-level Zod
 * validation and spinner→checkmark button state preserved as-is.
 */
export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  const password = useWatch({ control, name: "password" }) ?? "";
  const timersRef = useRef<number[]>([]);

  // Clear pending timers on unmount — otherwise a delayed navigate() can
  // fire after the user has already navigated elsewhere and silently
  // stomp it back to /onboarding (same class of bug as LoginPage's).
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  async function onSubmit(values: FormValues) {
    setFormError(null);
    setStatus("submitting");
    try {
      await signup(values.name, values.email, values.password, true);
      setStatus("success");
      // Routes to the dashboard, same as login — /onboarding is an
      // unbuilt stub page (no profile-setup wizard exists yet), so
      // sending new signups there was a dead end.
      const t2 = window.setTimeout(() => navigate("/app/dashboard", { replace: true }), 500);
      timersRef.current.push(t2);
    } catch (err) {
      setStatus("idle");
      setFormError(getApiErrorMessage(err, "Couldn't create your account. Try a different email."));
    }
  }

  function handleGoogleAuth() {
    // Full-page redirect to Google's real consent screen — control leaves
    // this component entirely here. Google redirects back to
    // /auth/google/callback with a `?code=...`, which is where
    // loginWithGoogle() actually gets called (see google-callback-page.tsx).
    // Signup vs. login both land on the same callback/consent flow — Google
    // doesn't distinguish "sign up" from "sign in," and the backend's
    // login_with_google() already creates a new account on first sign-in.
    // No "remember me" checkbox on this page (kept the signup form minimal,
    // per the "under a minute" copy) — default new accounts to remembered.
    window.sessionStorage.setItem("placement-prediction-remember-me-intent", "true");
    setGoogleLoading(true);
    redirectToGoogleConsent();
  }

  return (
    <AuthLayout
      switchPrompt={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent-ink hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <h2 className="text-xl font-display font-semibold text-text-primary">Create your account</h2>
      <p className="mt-1.5 text-sm text-text-secondary">Free forever. Takes under a minute.</p>

      <AnimatePresence>
        {formError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: DURATION.component, ease: EASE.symmetric }}
            className="mt-4 overflow-hidden"
          >
            <p className="rounded-md border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">{formError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        <SocialAuthButton onClick={handleGoogleAuth} isLoading={googleLoading} />
      </div>
      <Divider />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <TextInput
          label="Full name"
          autoComplete="name"
          placeholder="Ananya Sharma"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@college.edu"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="flex flex-col gap-2">
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrengthMeter password={password} />
        </div>
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={status === "submitting"}
          disabled={status !== "idle"}
          className="mt-2 w-full"
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === "success" ? (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: DURATION.micro, ease: EASE.expoOut }}
                className="inline-flex items-center gap-1.5"
              >
                <CheckIcon className="size-4" /> Account created
              </motion.span>
            ) : (
              <motion.span key="label">Create account</motion.span>
            )}
          </AnimatePresence>
        </Button>

        <p className="text-center text-xs text-text-muted">
          By signing up, you agree to our{" "}
          <a href="#" className="underline hover:text-text-secondary">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-text-secondary">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </AuthLayout>
  );
}
