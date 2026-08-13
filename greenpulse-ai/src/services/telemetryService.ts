import type { FleetTrendPoint } from "@/types";
import type { TelemetryMetricStatus, TelemetryMetricType, TelemetryReading } from "@/types";

export type TelemetryCanonicalMetricType = Exclude<TelemetryMetricType, "thermal_event_count">;

export interface TelemetryMetricConfig {
  metricType: TelemetryMetricType;
  apiMetricType: TelemetryCanonicalMetricType;
  label: string;
  unit: string;
  color: string;
  description: string;
}

const METRIC_CONFIGS: Record<TelemetryCanonicalMetricType, TelemetryMetricConfig> = {
  battery_health_percent: {
    metricType: "battery_health_percent",
    apiMetricType: "battery_health_percent",
    label: "Battery Health",
    unit: "%",
    color: "#3E9C49",
    description: "Battery charge retention",
  },
  battery_cycle_count: {
    metricType: "battery_cycle_count",
    apiMetricType: "battery_cycle_count",
    label: "Battery Cycles",
    unit: "cycles",
    color: "#3B82F6",
    description: "Battery charge cycles",
  },
  ssd_wear_percent: {
    metricType: "ssd_wear_percent",
    apiMetricType: "ssd_wear_percent",
    label: "SSD Wear",
    unit: "%",
    color: "#E0473A",
    description: "Solid-state drive wear level",
  },
  ssd_health_percent: {
    metricType: "ssd_health_percent",
    apiMetricType: "ssd_health_percent",
    label: "SSD Health",
    unit: "%",
    color: "#3E9C49",
    description: "Solid-state drive health",
  },
  thermal_event: {
    metricType: "thermal_event",
    apiMetricType: "thermal_event",
    label: "Thermal Events",
    unit: "events",
    color: "#E0473A",
    description: "Thermal throttling or temperature spikes",
  },
  cpu_temperature_c: {
    metricType: "cpu_temperature_c",
    apiMetricType: "cpu_temperature_c",
    label: "CPU Temperature",
    unit: "°C",
    color: "#D9A441",
    description: "Current CPU temperature",
  },
  ram_usage_percent: {
    metricType: "ram_usage_percent",
    apiMetricType: "ram_usage_percent",
    label: "RAM Usage",
    unit: "%",
    color: "#8B5CF6",
    description: "Memory pressure",
  },
  storage_usage_percent: {
    metricType: "storage_usage_percent",
    apiMetricType: "storage_usage_percent",
    label: "Storage Usage",
    unit: "%",
    color: "#06B6D4",
    description: "Disk fullness",
  },
};

export function normalizeTelemetryMetricType(metricType: TelemetryMetricType): TelemetryCanonicalMetricType {
  return metricType === "thermal_event_count" ? "thermal_event" : metricType;
}

export function getTelemetryMetricConfig(metricType: TelemetryMetricType) {
  return METRIC_CONFIGS[normalizeTelemetryMetricType(metricType)];
}

export function getTelemetryMetricLabel(metricType: TelemetryMetricType) {
  return getTelemetryMetricConfig(metricType).label;
}

export function getTelemetryMetricUnit(metricType: TelemetryMetricType) {
  return getTelemetryMetricConfig(metricType).unit;
}

export function formatTelemetryValue(metricType: TelemetryMetricType, value: number, unit?: string) {
  const resolvedUnit = unit ?? getTelemetryMetricUnit(metricType);
  const displayValue = Number.isInteger(value) ? String(value) : value.toFixed(1);

  if (!resolvedUnit) return displayValue;
  if (resolvedUnit === "%" || resolvedUnit === "°C") return `${displayValue}${resolvedUnit}`;
  return `${displayValue} ${resolvedUnit}`;
}

export function formatTelemetryTimestamp(isoDate: string) {
  return new Date(isoDate).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface TelemetrySnapshot {
  latestByMetric: Partial<Record<TelemetryCanonicalMetricType, TelemetryReading>>;
  lastTelemetryAt?: string;
}

export function buildTelemetrySnapshot(readings: TelemetryReading[]): TelemetrySnapshot {
  const latestByMetric: Partial<Record<TelemetryCanonicalMetricType, TelemetryReading>> = {};
  let lastTelemetryAt: string | undefined;

  for (const reading of readings) {
    const metricType = normalizeTelemetryMetricType(reading.metricType);
    if (!latestByMetric[metricType]) {
      latestByMetric[metricType] = reading;
    }

    if (!lastTelemetryAt || new Date(reading.recordedAt).getTime() > new Date(lastTelemetryAt).getTime()) {
      lastTelemetryAt = reading.recordedAt;
    }
  }

  return { latestByMetric, lastTelemetryAt };
}

export function buildTelemetryHistory(readings: TelemetryReading[]): FleetTrendPoint[] {
  return [...readings]
    .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime())
    .map((reading) => ({ date: reading.recordedAt, value: reading.value }));
}

export function evaluateTelemetryMetric(metricType: TelemetryMetricType, value: number): TelemetryMetricStatus {
  const canonicalMetric = normalizeTelemetryMetricType(metricType);

  switch (canonicalMetric) {
    case "battery_health_percent":
      if (value >= 80) return "HEALTHY";
      if (value >= 60) return "WARNING";
      if (value >= 40) return "HIGH_RISK";
      return "CRITICAL";
    case "battery_cycle_count":
      if (value < 300) return "HEALTHY";
      if (value < 600) return "WARNING";
      if (value < 900) return "HIGH_RISK";
      return "CRITICAL";
    case "ssd_health_percent":
      if (value >= 85) return "HEALTHY";
      if (value >= 70) return "WARNING";
      if (value >= 50) return "HIGH_RISK";
      return "CRITICAL";
    case "ssd_wear_percent":
      if (value < 20) return "HEALTHY";
      if (value <= 40) return "WARNING";
      if (value <= 60) return "HIGH_RISK";
      return "CRITICAL";
    case "cpu_temperature_c":
      if (value < 70) return "HEALTHY";
      if (value <= 80) return "WARNING";
      if (value <= 90) return "HIGH_RISK";
      return "CRITICAL";
    case "thermal_event":
      if (value <= 0) return "HEALTHY";
      if (value <= 2) return "WARNING";
      if (value <= 5) return "HIGH_RISK";
      return "CRITICAL";
    case "ram_usage_percent":
      if (value < 70) return "HEALTHY";
      if (value <= 85) return "WARNING";
      if (value <= 95) return "HIGH_RISK";
      return "CRITICAL";
    case "storage_usage_percent":
      if (value < 70) return "HEALTHY";
      if (value <= 85) return "WARNING";
      if (value <= 95) return "HIGH_RISK";
      return "CRITICAL";
    default:
      return "WARNING";
  }
}

export function getTelemetryStatusClasses(status: TelemetryMetricStatus) {
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
