import { useMemo } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/Buttons/Button";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";
import { Sparkline } from "@/components/Charts/Sparkline";
import { cn } from "@/lib/utils";
import { useTelemetry } from "@/hooks/useTelemetry";
import type { TelemetryMetricType } from "@/types";
import {
  buildTelemetryHistory,
  evaluateTelemetryMetric,
  formatTelemetryValue,
  getTelemetryMetricConfig,
  getTelemetryStatusClasses,
} from "@/services/telemetryService";

interface MetricHistoryCardProps {
  deviceId: string;
  metricType: TelemetryMetricType;
}

export function MetricHistoryCard({ deviceId, metricType }: MetricHistoryCardProps) {
  const config = getTelemetryMetricConfig(metricType);
  const query = useTelemetry(deviceId, { metricType, limit: 20 });

  const readings = query.data ?? [];
  const latest = readings[0];
  const latestStatus = latest ? evaluateTelemetryMetric(metricType, latest.value) : undefined;

  const chartData = useMemo(() => buildTelemetryHistory(readings), [readings]);

  if (query.isLoading) {
    return (
      <div className="rounded-card border border-border bg-surface p-4 shadow-card">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="mt-3 h-7 w-20" />
        <Skeleton className="mt-4 h-16 w-full" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-card border border-border bg-surface p-4 shadow-card">
        <EmptyState
          title={`Unable to load ${config.label.toLowerCase()}`}
          description="Try requesting the telemetry again."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{config.label}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{config.description}</p>
        </div>
        {latestStatus && (
          <span className={cn("rounded-pill px-2.5 py-1 text-[11px] font-medium", getTelemetryStatusClasses(latestStatus))}>
            {latestStatus.replace("_", " ")}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-semibold text-ink">
            {latest ? formatTelemetryValue(metricType, latest.value, latest.unit) : "—"}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {latest ? new Date(latest.recordedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "No readings yet"}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => query.refetch()}>
          <RefreshCcw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="mt-4 rounded-lg bg-surface-sunken px-3 py-2">
        {chartData.length ? <Sparkline data={chartData} color={config.color} height={64} /> : <p className="text-xs text-ink-muted">No telemetry history available.</p>}
      </div>
    </div>
  );
}
