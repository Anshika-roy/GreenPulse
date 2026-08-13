import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, User, CalendarDays, ShieldCheck } from "lucide-react";
import { useDevice } from "@/hooks/useDevices";
import { ApiError } from "@/lib/apiClient";
import { RiskBadge } from "@/components/Badges/RiskBadge";
import { HealthBar } from "@/components/ProgressBar/HealthBar";
import { ConfidenceBar } from "@/components/ProgressBar/ConfidenceBar";
import { DeviceHealthMiniChart } from "@/components/Charts/DeviceHealthMiniChart";
import { Button } from "@/components/Buttons/Button";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { formatEta } from "@/services/deviceService";
import { HealthAnalysisCard } from "@/components/Telemetry/HealthAnalysisCard";
import { MetricHistoryCard } from "@/components/Telemetry/MetricHistoryCard";
import type { TelemetryMetricType } from "@/types";

const RISK_CHART_COLOR = { high: "#E0473A", medium: "#D9A441", low: "#3E9C49" } as const;

const TELEMETRY_METRICS: TelemetryMetricType[] = [
  "battery_health_percent",
  "battery_cycle_count",
  "ssd_health_percent",
  "ssd_wear_percent",
  "cpu_temperature_c",
  "thermal_event",
  "ram_usage_percent",
  "storage_usage_percent",
];

export default function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: device, isLoading, isError, error, refetch } = useDevice(id);
  const deviceErrorStatus = error instanceof ApiError ? error.status : undefined;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full rounded-card" />
      </div>
    );
  }

  if (isError || !device) {
    return (
      <EmptyState
        title={deviceErrorStatus === 404 ? "Device not found" : "Unable to load device"}
        description={
          deviceErrorStatus === 404
            ? "This device may have been removed or retired."
            : error?.message ?? "Check the backend connection and try again."
        }
        actionLabel={"Retry"}
        onAction={() => (deviceErrorStatus === 404 ? navigate("/devices") : refetch())}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/devices" className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back to devices
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">{device.model}</h1>
          <p className="mt-1 text-sm text-ink-muted">{device.assetTag}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Run Diagnostics</Button>
          <Button>{device.recommendation.action}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">Health Trend</h2>
                <p className="mt-1 text-xs text-ink-muted">Historical device health score from the device record.</p>
              </div>
              <RiskBadge level={device.riskLevel} />
            </div>
            <DeviceHealthMiniChart history={device.healthHistory} color={RISK_CHART_COLOR[device.riskLevel]} />

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <p className="text-xs text-ink-muted">Health Score</p>
                <div className="mt-1">
                  <HealthBar value={device.healthScore} riskLevel={device.riskLevel} />
                </div>
              </div>
              <div>
                <p className="text-xs text-ink-muted">AI Confidence</p>
                <div className="mt-1">
                  <ConfidenceBar value={device.aiConfidence} />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-surface-sunken p-3.5">
              <p className="text-sm font-medium text-ink">{device.issue.label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Detected {formatEta(device.issue.detectedAt)} · Recommended: {device.recommendation.action} by {formatEta(device.recommendation.etaDate)}
              </p>
            </div>
          </div>

          <HealthAnalysisCard deviceId={device.id} />

          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">Telemetry History</h2>
                <p className="mt-1 text-xs text-ink-muted">Metric-by-metric telemetry pulled from /api/telemetry.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {TELEMETRY_METRICS.map((metricType) => (
                <MetricHistoryCard key={metricType} deviceId={device.id} metricType={metricType} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-ink">Device Details</h2>
            <dl className="space-y-3 text-sm">
              {device.owner && (
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-ink-faint" />
                  <div>
                    <dt className="text-xs text-ink-muted">Owner</dt>
                    <dd className="text-ink">
                      {device.owner.name} · {device.owner.department}
                    </dd>
                  </div>
                </div>
              )}
              {device.location && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-ink-faint" />
                  <div>
                    <dt className="text-xs text-ink-muted">Location</dt>
                    <dd className="text-ink">{device.location}</dd>
                  </div>
                </div>
              )}
              {device.warrantyExpiresAt && (
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-ink-faint" />
                  <div>
                    <dt className="text-xs text-ink-muted">Warranty expires</dt>
                    <dd className="text-ink">{formatEta(device.warrantyExpiresAt)}</dd>
                  </div>
                </div>
              )}
              {device.lastCheckedAt && (
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="h-4 w-4 text-ink-faint" />
                  <div>
                    <dt className="text-xs text-ink-muted">Last checked</dt>
                    <dd className="text-ink">{formatEta(device.lastCheckedAt)}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
