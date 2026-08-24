import { SectionCard } from "@/components/dashboard/section-card";
import { SkillBar } from "@/components/dashboard/skill-bar";
import { ProbabilityGauge } from "@/components/charts";
import { Chip } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { GitHubAccountData } from "@/hooks/use-github-integration";

const BREAKDOWN_LABELS: Record<string, string> = {
  repositories: "Repositories",
  stars: "Stars earned",
  language_diversity: "Language diversity",
  recent_activity: "Recent activity",
  community: "Community (followers)",
};

const BREAKDOWN_MAX: Record<string, number> = {
  repositories: 30,
  stars: 25,
  language_diversity: 15,
  recent_activity: 20,
  community: 10,
};

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface GitHubAnalyticsPanelProps {
  data: GitHubAccountData | { connected: false } | undefined;
  isLoading: boolean;
}

/**
 * Requirement #6 — "GitHub analytics panel that analyzes repositories and
 * calculates a developer score." Purely a display of what the backend
 * already computed (app/services/github_analytics.py) — no scoring logic
 * lives here, so the panel and the score can never drift apart.
 */
export function GitHubAnalyticsPanel({ data, isLoading }: GitHubAnalyticsPanelProps) {
  if (isLoading || data === undefined) {
    return (
      <SectionCard title="GitHub Analytics">
        <Skeleton className="h-48 w-full" />
      </SectionCard>
    );
  }

  if (!data.connected) {
    return (
      <SectionCard title="GitHub Analytics">
        <EmptyState
          title="No GitHub account connected"
          description="Connect your GitHub from Connected Accounts above to see your repository analytics and developer score."
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="GitHub Analytics"
      description="Derived from your public repositories and recent activity"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Score + stat row */}
        <div className="flex flex-col items-center gap-2 text-center lg:col-span-4 lg:items-start lg:text-left">
          <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Developer Score</p>
          <ProbabilityGauge value={data.developer_score} size="md" label="DEVELOPER SCORE" suffix="" tone="neutral" />
        </div>

        <div className="grid grid-cols-3 gap-4 lg:col-span-8 lg:grid-cols-4">
          <StatTile label="Public Repos" value={data.public_repos_count} />
          <StatTile label="Followers" value={data.followers_count} />
          <StatTile label="Languages" value={data.top_languages.length} />
          <StatTile label="Activity (90d)" value={data.recent_activity_count} />
        </div>
      </div>

      {/* Score breakdown */}
      <div className="mt-6 flex flex-col gap-4 border-t border-border-subtle pt-6">
        <p className="text-sm font-semibold text-text-primary">Score Breakdown</p>
        <div className="flex flex-col gap-4">
          {Object.entries(data.developer_score_breakdown).map(([key, value]) => (
            <SkillBar
              key={key}
              label={BREAKDOWN_LABELS[key] ?? key}
              current={value}
              max={BREAKDOWN_MAX[key] ?? 100}
            />
          ))}
        </div>
      </div>

      {/* Top languages */}
      {data.top_languages.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 border-t border-border-subtle pt-6">
          <p className="text-sm font-semibold text-text-primary">Programming Languages</p>
          <div className="flex flex-wrap gap-2">
            {data.top_languages.map((lang) => (
              <Chip key={lang.language}>
                {lang.language} <span className="text-text-muted">· {lang.percentage}%</span>
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Recent repos */}
      {data.recent_repos.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 border-t border-border-subtle pt-6">
          <p className="text-sm font-semibold text-text-primary">Recent Projects</p>
          <div className="flex flex-col gap-2">
            {data.recent_repos.map((repo) => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-md border border-border-subtle px-3.5 py-2.5 transition-colors hover:bg-bg-elevated-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{repo.name}</p>
                  {repo.description && (
                    <p className="mt-0.5 truncate text-xs text-text-muted">{repo.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-text-muted">
                  {repo.language && <span>{repo.language}</span>}
                  <span className="flex items-center gap-1">
                    <StarIcon className="size-3.5" /> {repo.stargazers_count}
                  </span>
                  <span className="hidden sm:inline">{formatDate(repo.updated_at)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border-subtle bg-bg-elevated-2 px-3 py-2.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{label}</span>
      <span className="font-display text-lg font-bold tabular-nums text-text-primary">{value}</span>
    </div>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
    </svg>
  );
}
