import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import type { GitHubAccountData } from "@/hooks/use-github-integration";
import { redirectToGitHubConsent } from "@/lib/github-oauth";

const GitHubMark = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.87 10.93c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.38.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.39-5.26 5.67.42.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.round(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

interface GitHubConnectCardProps {
  data: GitHubAccountData | { connected: false } | undefined;
  isLoading: boolean;
  isSyncing: boolean;
  onResync: () => void;
  onDisconnect: () => Promise<void>;
}

/**
 * Connected Accounts' GitHub row — requirement #5: replaces the plain
 * "Connect" button with a proper connected state (avatar, username, repo
 * count, last-synced time, Resync + Disconnect actions) once linked.
 */
export function GitHubConnectCard({ data, isLoading, isSyncing, onResync, onDisconnect }: GitHubConnectCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-between rounded-md border border-border-subtle px-3.5 py-2.5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    );
  }

  if (!data.connected) {
    return (
      <div className="flex items-center justify-between rounded-md border border-border-subtle px-3.5 py-2.5 transition-colors hover:bg-bg-elevated-2">
        <div className="flex items-center gap-3">
          <GitHubMark className="size-5 text-text-primary" />
          <span className="text-sm text-text-primary">GitHub</span>
        </div>
        <Button variant="ghost" size="sm" onClick={redirectToGitHubConsent}>
          Connect
        </Button>
      </div>
    );
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await onDisconnect();
      setConfirmOpen(false);
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-md border border-border-subtle px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={data.username} src={data.avatar_url ?? undefined} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <GitHubMark className="size-3.5 text-text-muted" />
              <a
                href={data.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-text-primary hover:text-accent-ink hover:underline"
              >
                @{data.username}
              </a>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">
              {data.public_repos_count} public repos · synced {formatRelativeTime(data.last_synced_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="ghost" size="sm" isLoading={isSyncing} onClick={onResync}>
            Resync
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
            Disconnect
          </Button>
        </div>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h3 className="text-md font-semibold text-danger">Disconnect GitHub?</h3>
        <p className="mt-2 text-sm text-text-secondary">
          This removes your linked GitHub profile and analytics from PlacementAI. Your GitHub account itself is
          unaffected.
        </p>
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
