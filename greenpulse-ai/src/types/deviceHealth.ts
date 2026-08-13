import type { TelemetryMetricStatus } from "./telemetry";

export type DeviceHealthRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DeviceHealthFactor {
  score: number;
  status: TelemetryMetricStatus;
  metrics: Record<string, number | undefined>;
}

export interface DeviceHealthRisk {
  metric: string;
  value: number;
  severity: "WARNING" | "HIGH" | "CRITICAL";
  message: string;
}

export interface DeviceHealthAnalysis {
  deviceId: string;
  healthScore: number;
  riskLevel: DeviceHealthRiskLevel;
  factors: {
    battery?: DeviceHealthFactor;
    ssd?: DeviceHealthFactor;
    thermal?: DeviceHealthFactor;
    memory?: DeviceHealthFactor;
    storage?: DeviceHealthFactor;
  };
  topRisks: DeviceHealthRisk[];
  recommendations: string[];
}
