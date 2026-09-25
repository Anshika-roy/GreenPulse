import { useState } from "react";
import { Wrench, Ticket, Check } from "lucide-react";
import devicesMock from "@/mock/devices.json";
import { RiskBadge } from "@/components/Badges/RiskBadge";
import { Button } from "@/components/Buttons/Button";

type GroupKey = "CRITICAL" | "HIGH_RISK" | "WATCH" | "HEALTHY";

export function ActionCenter() {
  const [activeGroup, setActiveGroup] = useState<GroupKey>("CRITICAL");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const devices = devicesMock as Array<Record<string, any>>;

  const groups: Record<GroupKey, Array<Record<string, any>>> = {
    CRITICAL: devices.filter((d) => d.healthScore < 50),
    HIGH_RISK: devices.filter((d) => d.healthScore >= 50 && d.healthScore < 65),
    WATCH: devices.filter((d) => d.healthScore >= 65 && d.healthScore < 80),
    HEALTHY: devices.filter((d) => d.healthScore >= 80),
  };

  const currentGroupDevices = groups[activeGroup] || [];

  function triggerAction(actionName: string, deviceModel: string, assetTag: string) {
    setActionFeedback(`✅ Prototype Action: "${actionName}" submitted for ${deviceModel} (${assetTag}). Ticket/Task logged.`);
    setTimeout(() => setActionFeedback(null), 4000);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Wrench className="h-5 w-5 text-brand-600" />
            AI Action Center & Risk Categorization
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Automated priority grouping with actionable intervention steps.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveGroup("CRITICAL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeGroup === "CRITICAL"
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-surface-sunken text-ink-muted hover:text-ink"
            }`}
          >
            Critical ({groups.CRITICAL.length})
          </button>
          <button
            onClick={() => setActiveGroup("HIGH_RISK")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeGroup === "HIGH_RISK"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-surface-sunken text-ink-muted hover:text-ink"
            }`}
          >
            High Risk ({groups.HIGH_RISK.length})
          </button>
          <button
            onClick={() => setActiveGroup("WATCH")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeGroup === "WATCH"
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-surface-sunken text-ink-muted hover:text-ink"
            }`}
          >
            Watch List ({groups.WATCH.length})
          </button>
          <button
            onClick={() => setActiveGroup("HEALTHY")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeGroup === "HEALTHY"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-surface-sunken text-ink-muted hover:text-ink"
            }`}
          >
            Healthy ({groups.HEALTHY.length})
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          {actionFeedback}
        </div>
      )}

      <div className="space-y-3">
        {currentGroupDevices.slice(0, 5).map((device: Record<string, any>) => {
          const estimatedSavings = Math.round((100 - device.healthScore) * 350);
          const failureEtaDays = device.healthScore < 60 ? 14 : device.healthScore < 80 ? 45 : 120;

          return (
            <div
              key={device.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface-sunken p-4 transition hover:border-brand-500/30"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-ink">{device.model}</span>
                  <span className="text-xs text-ink-muted">({device.assetTag})</span>
                  <RiskBadge level={device.riskLevel} />
                </div>
                <p className="text-xs text-ink-muted">
                  <strong>Issue:</strong> {device.issue?.label || "Component degradation"} ·{" "}
                  <strong>ETA Window:</strong> {failureEtaDays} Days
                </p>
                <p className="text-xs text-brand-700 dark:text-brand-400 font-medium">
                  💡 <strong>Action:</strong> {device.recommendedAction?.label || "Inspect telemetry"} (Est. Savings: ₹{(estimatedSavings / 1000).toFixed(1)}k)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs"
                  onClick={() => triggerAction("Schedule Service", device.model, device.assetTag)}
                >
                  <Wrench className="mr-1 h-3.5 w-3.5" /> Schedule Service
                </Button>
                <Button
                  className="py-1 px-2.5 text-xs"
                  onClick={() => triggerAction("Create Support Ticket", device.model, device.assetTag)}
                >
                  <Ticket className="mr-1 h-3.5 w-3.5" /> Create Ticket
                </Button>
                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs"
                  onClick={() => triggerAction("Mark Reviewed", device.model, device.assetTag)}
                >
                  <Check className="mr-1 h-3.5 w-3.5" /> Mark Reviewed
                </Button>
              </div>
            </div>
          );
        })}

        {currentGroupDevices.length === 0 && (
          <div className="py-8 text-center text-xs text-ink-muted">
            No devices currently in {activeGroup} status.
          </div>
        )}
      </div>
    </div>
  );
}
