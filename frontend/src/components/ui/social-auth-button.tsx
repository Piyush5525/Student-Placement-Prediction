import { motion } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...props}>
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4.01-3.1Z" />
    <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.62l4.01 3.1c.95-2.85 3.6-4.96 6.73-4.96Z" />
  </svg>
);

/**
 * SocialAuthButton (Google) — FRONTEND_ARCHITECTURE §6.2 component list.
 * No real OAuth — clicking simulates the same mock-session flow the
 * email/password form uses, so the auth surface stays fully connected end
 * to end without a backend.
 */
export function SocialAuthButton({ onClick, isLoading }: { onClick: () => void; isLoading?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      whileHover={isLoading ? undefined : { scale: 1.015 }}
      whileTap={isLoading ? undefined : { scale: 0.98 }}
      transition={{ duration: DURATION.micro, ease: EASE.expoOut }}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-border-subtle bg-bg-elevated-2/80 px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-bg-elevated-2 disabled:opacity-50"
    >
      {isLoading ? (
        <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
      ) : (
        <>
          <GoogleIcon />
          Continue with Google
        </>
      )}
    </motion.button>
  );
}

/** Divider — FRONTEND_ARCHITECTURE §6.2: "or continue with" separator between social and email auth. */
export function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-1" role="separator">
      <span className="h-px flex-1 bg-border-subtle" />
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{label}</span>
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}
