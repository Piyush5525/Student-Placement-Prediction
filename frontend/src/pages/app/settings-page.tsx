import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader, SectionCard, GitHubConnectCard, GitHubAnalyticsPanel, GoogleConnectCard } from "@/components/dashboard";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TextInput, PasswordInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { crossFadeVariants, DURATION } from "@/lib/motion";
import { useThemeStore, type ThemeChoice, type Density } from "@/stores/theme-store";
import { useAuthStore } from "@/stores/auth-store";
import { useSettings } from "@/hooks/use-settings";
import { useGitHubIntegration } from "@/hooks/use-github-integration";

type SettingsSection = "account" | "notifications" | "appearance" | "privacy" | "danger";

const SECTIONS: { id: SettingsSection; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "privacy", label: "Privacy & Data" },
  { id: "danger", label: "Danger Zone" },
];

const THEME_OPTIONS: { label: string; value: ThemeChoice; swatch: string }[] = [
  { label: "Dark", value: "dark", swatch: "bg-[#05060A]" },
  { label: "Light", value: "light", swatch: "bg-[#F5F6FA]" },
  { label: "System", value: "system", swatch: "bg-gradient-to-br from-[#05060A] to-[#F5F6FA]" },
];

const DENSITY_OPTIONS: { label: string; value: Density }[] = [
  { label: "Comfortable", value: "comfortable" },
  { label: "Compact", value: "compact" },
];

function SavedFlash({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.micro }}
          className="font-mono text-xs text-success"
        >
          Saved
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function useSavedFlash() {
  const [saved, setSaved] = useState(false);
  function flash() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }
  return { saved, flash };
}

const NOTIFICATION_KEYS = ["newPrediction", "weeklyDigest", "recommendationAlerts"] as const;
type NotificationKey = (typeof NOTIFICATION_KEYS)[number];

const NOTIFICATION_COPY: Record<NotificationKey, { label: string; description: string }> = {
  newPrediction: { label: "New prediction available", description: "Notify me when a fresh placement prediction is ready." },
  weeklyDigest: { label: "Weekly progress digest", description: "A weekly summary of score changes and milestones." },
  recommendationAlerts: { label: "Recommendation alerts", description: "Notify me when a new high-impact recommendation appears." },
};

/** UI's camelCase notification keys → backend's snake_case field names (GET/PUT /settings). */
const BACKEND_NOTIFICATION_KEY: Record<NotificationKey, "new_prediction" | "weekly_digest" | "recommendation_alerts"> = {
  newPrediction: "new_prediction",
  weeklyDigest: "weekly_digest",
  recommendationAlerts: "recommendation_alerts",
};

/**
 * Settings — FRONTEND_ARCHITECTURE §6.14. Sticky glass sub-nav + content
 * panel, cross-fades on section switch. Appearance section reads/writes
 * the real theme-store (theme/reducedMotionOverride/density already
 * scaffolded there). No backend — Account/Privacy actions are UI-only.
 */
export function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>("account");
  const settingsQuery = useSettings();
  const githubQuery = useGitHubIntegration();

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account, notifications, and appearance." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <nav className="flex gap-1 overflow-x-auto lg:sticky lg:top-6 lg:flex-col lg:gap-0.5 lg:overflow-visible">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cn(
                  "shrink-0 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                  section === s.id
                    ? "bg-accent-soft text-accent-ink"
                    : s.id === "danger"
                      ? "text-danger/80 hover:bg-danger/10 hover:text-danger"
                      : "text-text-secondary hover:bg-bg-elevated-2 hover:text-text-primary",
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div key={section} initial="initial" animate="animate" exit="exit" variants={crossFadeVariants}>
              {section === "account" && <AccountSection settingsQuery={settingsQuery} githubQuery={githubQuery} />}
              {section === "notifications" && <NotificationsSection settingsQuery={settingsQuery} />}
              {section === "appearance" && <AppearanceSection />}
              {section === "privacy" && <PrivacySection settingsQuery={settingsQuery} />}
              {section === "danger" && <DangerZoneSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

type SettingsQuery = ReturnType<typeof useSettings>;
type GitHubQuery = ReturnType<typeof useGitHubIntegration>;

function AccountSection({ settingsQuery, githubQuery }: { settingsQuery: SettingsQuery; githubQuery: GitHubQuery }) {
  const { saved, flash } = useSavedFlash();
  const { data, isLoading, error, refetch } = settingsQuery;
  const github = githubQuery;

  if (error && !data) {
    return <ErrorState description={error} onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Account" action={<SavedFlash show={saved} />}>
        <div className="flex flex-col gap-4">
          {isLoading || !data ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <TextInput label="Email" type="email" defaultValue={data.email} onBlur={flash} disabled />
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PasswordInput label="New password" placeholder="Leave blank to keep current" onBlur={flash} />
            <PasswordInput label="Confirm new password" placeholder="••••••••" onBlur={flash} />
          </div>
          <Button variant="primary" size="sm" className="self-start" onClick={flash}>
            Save changes
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Connected Accounts">
        <div className="flex flex-col gap-2">
          <GoogleConnectCard />
          <GitHubConnectCard
            data={github.data}
            isLoading={github.isLoading}
            isSyncing={github.isSyncing}
            onResync={() => void github.resync()}
            onDisconnect={github.disconnect}
          />
        </div>
      </SectionCard>

      <GitHubAnalyticsPanel data={github.data} isLoading={github.isLoading} />
    </div>
  );
}

function NotificationsSection({ settingsQuery }: { settingsQuery: SettingsQuery }) {
  const { data, isLoading, error, refetch, updateSettings } = settingsQuery;
  const { saved, flash } = useSavedFlash();

  if (error && !data) {
    return <ErrorState description={error} onRetry={refetch} />;
  }

  async function handleToggle(key: NotificationKey, checked: boolean) {
    try {
      await updateSettings({ notifications: { [BACKEND_NOTIFICATION_KEY[key]]: checked } });
      flash();
    } catch {
      // Swallow — SavedFlash simply won't show; the toggle UI still
      // reflects the last successfully-fetched server state on next load.
    }
  }

  return (
    <SectionCard title="Notifications" action={<SavedFlash show={saved} />}>
      <div className="flex flex-col gap-5">
        {isLoading || !data
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
          : NOTIFICATION_KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-primary">{NOTIFICATION_COPY[key].label}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{NOTIFICATION_COPY[key].description}</p>
                </div>
                <ToggleSwitch
                  checked={data.notifications[BACKEND_NOTIFICATION_KEY[key]]}
                  onChange={(checked) => void handleToggle(key, checked)}
                  label={NOTIFICATION_COPY[key].label}
                />
              </div>
            ))}
      </div>
    </SectionCard>
  );
}

function AppearanceSection() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const reducedMotionOverride = useThemeStore((s) => s.reducedMotionOverride);
  const setReducedMotionOverride = useThemeStore((s) => s.setReducedMotionOverride);
  const density = useThemeStore((s) => s.density);
  const setDensity = useThemeStore((s) => s.setDensity);
  const { saved, flash } = useSavedFlash();

  return (
    <SectionCard title="Appearance" action={<SavedFlash show={saved} />}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-text-primary">Theme</p>
          <div className="mt-3 flex gap-3">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  flash();
                }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-md border p-3 transition-colors",
                  theme === opt.value ? "border-accent-ink bg-accent-soft" : "border-border-subtle hover:border-border-strong",
                )}
              >
                <span className={cn("size-10 rounded-full border border-border-subtle", opt.swatch)} />
                <span className="text-xs text-text-secondary">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Reduced motion</p>
            <p className="mt-0.5 text-xs text-text-muted">Turn off animations regardless of your OS setting.</p>
          </div>
          <ToggleSwitch
            checked={reducedMotionOverride}
            onChange={(checked) => {
              setReducedMotionOverride(checked);
              flash();
            }}
            label="Reduced motion"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-text-primary">Density</p>
          <p className="mt-0.5 text-xs text-text-muted">Affects table/list spacing on Analytics and Dashboard.</p>
          <div className="mt-3">
            <SegmentedControl
              options={DENSITY_OPTIONS}
              value={density}
              onChange={(value) => {
                setDensity(value);
                flash();
              }}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function PrivacySection({ settingsQuery }: { settingsQuery: SettingsQuery }) {
  const [exporting, setExporting] = useState(false);
  const { data, isLoading, error, refetch, updateSettings } = settingsQuery;
  const { saved, flash } = useSavedFlash();

  if (error && !data) {
    return <ErrorState description={error} onRetry={refetch} />;
  }

  async function handleDataSharingToggle(checked: boolean) {
    try {
      await updateSettings({ privacy: { data_sharing_enabled: checked } });
      flash();
    } catch {
      // Same best-effort treatment as NotificationsSection's toggle.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="How your data is used" action={<SavedFlash show={saved} />}>
        <p className="text-sm leading-relaxed text-text-secondary">
          Your placement prediction is generated from the profile fields you provide — academics, skills, activity, and
          engagement signals. Nothing is shared with third parties, and your data is never used to train models for other
          students' predictions.
        </p>
        {!isLoading && data && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border-subtle pt-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Data sharing</p>
              <p className="mt-0.5 text-xs text-text-muted">Allow anonymized data to improve model accuracy.</p>
            </div>
            <ToggleSwitch
              checked={data.privacy.data_sharing_enabled}
              onChange={(checked) => void handleDataSharingToggle(checked)}
              label="Data sharing"
            />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Export your data">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">Download a copy of everything associated with your account.</p>
          <Button variant="ghost" size="sm" isLoading={exporting} onClick={() => { setExporting(true); setTimeout(() => setExporting(false), 1200); }}>
            Export my data
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function DangerZoneSection() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const clearSession = useAuthStore((s) => s.clearSession);

  return (
    <>
      <SectionCard className="border-danger/30">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 rounded-md border border-danger/30 bg-danger/5 p-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Reset profile</p>
              <p className="mt-0.5 text-xs text-text-muted">Clears all profile fields and prediction history. Cannot be undone.</p>
            </div>
            <Button variant="danger" size="sm">
              Reset
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md border border-danger/30 bg-danger/5 p-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Delete account</p>
              <p className="mt-0.5 text-xs text-text-muted">Permanently deletes your account and all associated data.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              Delete account
            </Button>
          </div>
        </div>
      </SectionCard>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h3 className="text-md font-semibold text-danger">Delete your account?</h3>
        <p className="mt-2 text-sm text-text-secondary">
          This permanently deletes your account and all data. Type <span className="font-mono text-text-primary">DELETE</span> to confirm.
        </p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="mt-4 w-full rounded-md border border-border-subtle bg-bg-elevated-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/20"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={confirmText !== "DELETE"}
            onClick={() => {
              setConfirmOpen(false);
              clearSession();
            }}
          >
            Delete account
          </Button>
        </div>
      </Modal>
    </>
  );
}
