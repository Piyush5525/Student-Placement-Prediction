import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { AuthLayout } from "@/layouts/auth-layout";
import { TextInput, PasswordInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { SocialAuthButton, Divider } from "@/components/ui/social-auth-button";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-client";
import { redirectToGoogleConsent } from "@/lib/google-oauth";
import { DURATION, EASE } from "@/lib/motion";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * Login — FRONTEND_ARCHITECTURE §6.2, now wired to the real backend via
 * AuthProvider (src/context/auth-context.tsx). Field-level Zod validation
 * on blur/submit, spinner→checkmark button state per spec, preserved as-is
 * — only the submit handler's implementation changed from a setTimeout to
 * a real POST /auth/login call.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const timersRef = useRef<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  // Clear any pending timers on unmount so a stale timeout can never fire
  // navigate() after this page is gone — this is what previously let a
  // delayed post-login redirect stomp the very next navigation the user
  // made on the authenticated shell (PublicOnlyRoute's own reactive
  // redirect already sends an authenticated visitor to /app/dashboard the
  // instant setSession() flips isAuthenticated; this effect only needs to
  // additionally honor the "return to intended page" case).
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  function redirectAfterAuth() {
    const from = (location.state as { from?: Location })?.from?.pathname;
    if (from) {
      const t2 = window.setTimeout(() => navigate(from, { replace: true }), 500);
      timersRef.current.push(t2);
    }
    // No `from` state: PublicOnlyRoute's own reactive redirect (based on
    // isAuthenticated) already sends the visitor to /app/dashboard —
    // nothing further to do here.
  }

  async function onSubmit(values: FormValues) {
    setFormError(null);
    setStatus("submitting");
    try {
      await login(values.email, values.password, rememberMe);
      setStatus("success");
      redirectAfterAuth();
    } catch (err) {
      setStatus("idle");
      setFormError(getApiErrorMessage(err, "Couldn't log in. Check your email and password."));
    }
  }

  function handleGoogleAuth() {
    // Full-page redirect to Google's real consent screen — control leaves
    // this component entirely here, so `rememberMe` can't be passed as a
    // function argument across the round trip. Stash it in sessionStorage
    // (survives the redirect within the same tab) and GoogleCallbackPage
    // reads it back before calling loginWithGoogle().
    window.sessionStorage.setItem("placement-prediction-remember-me-intent", String(rememberMe));
    setGoogleLoading(true);
    redirectToGoogleConsent();
  }

  return (
    <AuthLayout
      switchPrompt={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-accent-ink hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <h2 className="text-xl font-display font-semibold text-text-primary">Welcome back</h2>
      <p className="mt-1.5 text-sm text-text-secondary">Log in to see your latest placement prediction.</p>

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
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@college.edu"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="mt-2 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-3.5 rounded-sm border-border-subtle bg-bg-elevated-2 accent-accent-solid"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-xs text-text-secondary hover:text-accent-ink hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

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
                <CheckIcon className="size-4" /> Logged in
              </motion.span>
            ) : (
              <motion.span key="label">Log in</motion.span>
            )}
          </AnimatePresence>
        </Button>
      </form>
    </AuthLayout>
  );
}
