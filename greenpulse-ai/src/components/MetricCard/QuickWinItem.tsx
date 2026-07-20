import { Battery, CheckCircle2, CalendarClock } from "lucide-react";
import type { ActionPlanSummary } from "@/types";

const ICONS: Record<ActionPlanSummary["quickWins"][number]["icon"], React.ElementType> = {
  battery: Battery,
  check: CheckCircle2,
  warranty: CalendarClock,
};

/** One row inside the Today's Action Plan card, e.g. "12 batteries need replacement" */
export function QuickWinItem({ icon, label }: ActionPlanSummary["quickWins"][number]) {
  const Icon = ICONS[icon];
  return (
    <li className="flex items-center gap-2.5 text-sm text-ink">
      <Icon className="h-4 w-4 shrink-0 text-brand-600" />
      <span>{label}</span>
    </li>
  );
}
