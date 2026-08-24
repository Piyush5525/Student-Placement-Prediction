import { Badge } from "@/components/ui/badge";
import type { ImpactLevel } from "@/mock/recommendations";

const PRIORITY_TONE = { High: "danger", Medium: "warning", Low: "info" } as const;

/** PriorityBadge — DESIGN_SYSTEM §04: High/Medium/Low impact, reusing the shared Badge's semantic tones. */
export function PriorityBadge({ level }: { level: ImpactLevel }) {
  return <Badge tone={PRIORITY_TONE[level]}>{level} impact</Badge>;
}
