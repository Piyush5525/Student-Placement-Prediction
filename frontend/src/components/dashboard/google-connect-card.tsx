import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/context/auth-context";
import { useAuthStore } from "@/stores/auth-store";
import { redirectToGoogleConsent } from "@/lib/google-oauth";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...props}>
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4.01-3.1Z" />
    <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.62l4.01 3.1c.95-2.85 3.6-4.96 6.73-4.96Z" />
  </svg>
);

/**
 * Connected Accounts' Google row — reads the REAL linked-provider state
 * from the authenticated user (backend's `google_linked`/`google_email`/
 * `google_picture`, exposed via GET /auth/me), not a hardcoded button. A
 * user who logged in with Google — or a password user who later linked
 * Google — sees "✓ Connected as {email}"; only a genuinely unlinked
 * account sees "Connect".
 */
export function GoogleConnectCard() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const { disconnectGoogle } = useAuth();

  if (!user?.googleLinked) {
    return (
      <div className="flex items-center justify-between rounded-md border border-border-subtle px-3.5 py-2.5 transition-colors hover:bg-bg-elevated-2">
        <div className="flex items-center gap-3">
          <GoogleIcon className="size-5" />
          <span className="text-sm text-text-primary">Google</span>
        </div>
        <Button variant="ghost" size="sm" onClick={redirectToGoogleConsent}>
          Connect
        </Button>
      </div>
    );
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    setError(null);
    try {
      await disconnectGoogle();
      setConfirmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't disconnect Google.");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-md border border-border-subtle px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.googlePicture ?? undefined} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <GoogleIcon className="size-3.5" />
              <span className="text-sm font-medium text-text-primary">Google</span>
              <Badge tone="success">✓ Connected</Badge>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">as {user.googleEmail ?? user.email}</p>
          </div>
        </div>
        <Button variant="danger" size="sm" className="self-end sm:self-auto" onClick={() => setConfirmOpen(true)}>
          Disconnect
        </Button>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h3 className="text-md font-semibold text-danger">Disconnect Google?</h3>
        <p className="mt-2 text-sm text-text-secondary">
          You'll need your password to sign in from now on. Your Google account itself is unaffected.
        </p>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={disconnecting} onClick={() => void handleDisconnect()}>
            Disconnect
          </Button>
        </div>
      </Modal>
    </>
  );
}
