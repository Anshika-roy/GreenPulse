export type TelemetryMetricType =
  | "battery_health_percent"
  | "battery_cycle_count"
  | "ssd_wear_percent"
  | "ssd_health_percent"
  | "thermal_event"
  | "thermal_event_count"
  | "cpu_temperature_c"
  | "ram_usage_percent"
  | "storage_usage_percent";

export type TelemetrySource = "real_agent" | "demo_simulated";

export interface TelemetryReading {
  id: string;
  deviceId: string;
  metricType: TelemetryMetricType;
  value: number;
  unit?: string;
  source: TelemetrySource;
  recordedAt: string;
}

export interface TelemetryQueryParams {
  metricType?: TelemetryMetricType;
  limit?: number;
}

export interface TelemetryTrendPoint {
  date: string;
  value: number;
}

export type TelemetryMetricStatus = "HEALTHY" | "WARNING" | "HIGH_RISK" | "CRITICAL";
