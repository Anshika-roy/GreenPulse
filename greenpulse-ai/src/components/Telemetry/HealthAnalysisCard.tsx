import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useDeviceHealth } from "@/hooks/useDeviceHealth";
import { Button } from "@/components/Buttons/Button";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";
import { cn } from "@/lib/utils";
import type { DeviceHealthAnalysis, DeviceHealthFactor } from "@/types";

function riskClasses(riskLevel: DeviceHealthAnalysis["riskLevel"]) {
  switch (riskLevel) {
    case "LOW":
      return "bg-risk-low-bg text-risk-low";
    case "MEDIUM":
      return "bg-risk-medium-bg text-risk-medium";
    case "HIGH":
    case "CRITICAL":
      return "bg-risk-high-bg text-risk-high";
  }
}

function statusClasses(status: DeviceHealthFactor["status"]) {
  switch (status) {
    case "HEALTHY":
      return "bg-risk-low-bg text-risk-low";
    case "WARNING":
      return "bg-risk-medium-bg text-risk-medium";
    case "HIGH_RISK":
    case "CRITICAL":
      return "bg-risk-high-bg text-risk-high";
  }
}

function statusLabel(status: DeviceHealthFactor["status"]) {
  return status.replace("_", " ");
}

interface HealthAnalysisCardProps {
  deviceId: string;
}

export function HealthAnalysisCard({ deviceId }: HealthAnalysisCardProps) {
  const query = useDeviceHealth(deviceId);

  if (query.isLoading) {
    return (
      <div className="rounded-card border border-border bg-surface p-5 shadow-card">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-8 w-20" />
        <Skeleton className="mt-4 h-28 w-full" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-card border border-border bg-surface p-5 shadow-card">
        <EmptyState
          icon={AlertTriangle}
          title="Health analysis unavailable"
          description="Retry to fetch the latest telemetry-based health score."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      </div>
    );
  }

  const analysis = query.data;
  if (!analysis) return null;

  const factorEntries = Object.entries(analysis.factors).filter(([, factor]) => Boolean(factor)) as Array<[
    keyof DeviceHealthAnalysis["factors"],
    NonNullable<DeviceHealthAnalysis["factors"][keyof DeviceHealthAnalysis["factors"]]>
  ]>;

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Health Analysis</h2>
          <p className="mt-1 text-xs text-ink-muted">Telemetry-derived device health score and risk assessment.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-pill px-2.5 py-1 text-xs font-medium", riskClasses(analysis.riskLevel))}>
            {analysis.riskLevel}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => query.refetch()}>
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr]">
        <div className="rounded-lg bg-surface-sunken p-4">
          <p className="text-xs text-ink-muted">Health Score</p>
          <p className="mt-2 text-4xl font-semibold text-ink">{analysis.healthScore}</p>
          <p className="mt-1 text-xs text-ink-muted">/100 overall</p>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {factorEntries.map(([key, factor]) => (
            <div key={key} className="rounded-lg border border-border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{key}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-lg font-semibold text-ink">{factor.score}</span>
                <span className={cn("rounded-pill px-2 py-0.5 text-[11px] font-medium", statusClasses(factor.status))}>
                  {statusLabel(factor.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Top Risks</h3>
          {analysis.topRisks.length ? (
            <ul className="mt-3 space-y-2">
              {analysis.topRisks.map((risk) => (
                <li key={`${risk.metric}-${risk.message}`} className="rounded-lg border border-border bg-surface-sunken p-3 text-sm text-ink">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{risk.metric}</p>
                      <p className="mt-1 text-xs text-ink-muted">{risk.message}</p>
                    </div>
                    <span className={cn("rounded-pill px-2 py-0.5 text-[11px] font-medium", riskClasses(risk.severity === "CRITICAL" ? "CRITICAL" : risk.severity === "HIGH" ? "HIGH" : "MEDIUM"))}>
                      {risk.severity}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">No high-risk telemetry patterns detected.</p>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Recommendations</h3>
          {analysis.recommendations.length ? (
            <ul className="mt-3 space-y-2">
              {analysis.recommendations.map((recommendation) => (
                <li key={recommendation} className="rounded-lg border border-border bg-surface-sunken p-3 text-sm text-ink">
                  {recommendation}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">No recommendations at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
