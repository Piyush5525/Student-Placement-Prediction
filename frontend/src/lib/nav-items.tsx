import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavItem {
  label: string;
  to: string;
  icon: IconComponent;
}

export interface NavCluster {
  id: string;
  items: NavItem[];
}

/** Minimal stroke icons — placeholders until a real icon set is chosen at page-build time. */
function makeIcon(path: string): IconComponent {
  return function Icon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d={path} />
      </svg>
    );
  };
}

const icons = {
  dashboard: makeIcon("M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z"),
  prediction: makeIcon("M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"),
  recommendations: makeIcon("M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"),
  resume: makeIcon("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M9 13h6M9 17h6"),
  interview: makeIcon("M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9-1.5 0-2.9-.37-4.14-1.02L3 21l1.02-3.86A8.96 8.96 0 0 1 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9Z"),
  leaderboard: makeIcon("M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4ZM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"),
  analytics: makeIcon("M3 3v18h18M7 14l3-3 3 3 5-6"),
  profile: makeIcon("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"),
  settings: makeIcon("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"),
  logout: makeIcon("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"),
};

/**
 * Sidebar structure — FRONTEND_ARCHITECTURE §5: three visual clusters
 * (Insights / Preparation / Community) plus an Account cluster, order
 * communicating grouping without needing labels.
 */
export const NAV_CLUSTERS: NavCluster[] = [
  {
    id: "insights",
    items: [
      { label: "Dashboard", to: "/app/dashboard", icon: icons.dashboard },
      { label: "Prediction", to: "/app/prediction", icon: icons.prediction },
      { label: "Recommendations", to: "/app/recommendations", icon: icons.recommendations },
      { label: "Analytics", to: "/app/analytics", icon: icons.analytics },
    ],
  },
  {
    id: "preparation",
    items: [
      { label: "Resume", to: "/app/resume", icon: icons.resume },
      { label: "Interview Prep", to: "/app/interview", icon: icons.interview },
    ],
  },
  {
    id: "community",
    items: [{ label: "Leaderboard", to: "/app/leaderboard", icon: icons.leaderboard }],
  },
  {
    id: "account",
    items: [
      { label: "Profile", to: "/app/profile", icon: icons.profile },
      { label: "Settings", to: "/app/settings", icon: icons.settings },
    ],
  },
];

export const logoutIcon = icons.logout;
