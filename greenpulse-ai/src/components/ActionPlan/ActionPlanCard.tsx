import { motion } from "framer-motion";
import { Activity, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/Buttons/Button";
import { QuickWinItem } from "@/components/MetricCard/QuickWinItem";
import type { ActionPlanSummary } from "@/types";
import { formatInrAsLakhs } from "@/services/dashboardService";

interface ActionPlanCardProps {
  actionPlan: ActionPlanSummary;
  onViewPlan: () => void;
}

/** "Today's Action Plan" — the hero card at the top of /dashboard */
export function ActionPlanCard({ actionPlan, onViewPlan }: ActionPlanCardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 rounded-card border border-border bg-surface p-6 shadow-card lg:grid-cols-[auto_1fr_auto]">
      {/* Circular AI pulse icon */}
      <div className="flex items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-brand-100">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-brand-300"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <Activity className="h-9 w-9 text-brand-600" strokeWidth={2} />
        </div>
      </div>

      {/* Summary + CTA */}
      <div className="flex flex-col justify-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Today's Action Plan
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-ink">
          {actionPlan.summaryText}
        </p>
        <div>
          <Button onClick={onViewPlan} size="md">
            View Action Plan
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick wins + savings */}
      <div className="flex flex-col gap-4 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <ul className="space-y-2.5">
          {actionPlan.quickWins.map((item) => (
            <QuickWinItem key={item.label} {...item} />
          ))}
        </ul>
        <div className="flex gap-6 border-t border-border pt-3">
          <div>
            <p className="text-xs text-ink-muted">Estimated Savings</p>
            <p className="text-lg font-semibold text-brand-600">
              {formatInrAsLakhs(actionPlan.estimatedSavingsInr)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">E-waste Prevented</p>
            <p className="text-lg font-semibold text-ink">{actionPlan.ewastePreventedKg} kg</p>
          </div>
        </div>
      </div>
    </div>
  );
}
