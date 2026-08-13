import { apiRequest } from "@/lib/apiClient";
import devicesMock from "@/mock/devices.json";
import type { Device, DeviceHealthAnalysis, DeviceHealthRiskLevel, TelemetryMetricType, TelemetryReading } from "@/types";
import { createMockTelemetryReadings } from "./telemetry";
import { evaluateTelemetryMetric, normalizeTelemetryMetricType } from "@/services/telemetryService";

const MOCK_DEVICES = devicesMock as Device[];

function getMockDevice(deviceId: string) {
  const device = MOCK_DEVICES.find((entry) => entry.id === deviceId);
  if (!device) throw new Error(`Device ${deviceId} not found in mock health source`);
  return device;
}

function scoreToRiskLevel(score: number): DeviceHealthRiskLevel {
  if (score >= 85) return "LOW";
  if (score >= 70) return "MEDIUM";
  if (score >= 55) return "HIGH";
  return "CRITICAL";
}

function scoreFromStatus(status: ReturnType<typeof evaluateTelemetryMetric>) {
  switch (status) {
    case "HEALTHY":
      return 100;
    case "WARNING":
      return 80;
    case "HIGH_RISK":
      return 50;
    case "CRITICAL":
      return 10;
  }
}

function latestMetric(readings: TelemetryReading[], metricType: TelemetryMetricType) {
  return readings.find((reading) => normalizeTelemetryMetricType(reading.metricType) === normalizeTelemetryMetricType(metricType));
}

function buildMockAnalysis(deviceId: string): DeviceHealthAnalysis {
  const device = getMockDevice(deviceId);
  const readings = createMockTelemetryReadings(deviceId);

  const batteryHealth = latestMetric(readings, "battery_health_percent");
  const batteryCycles = latestMetric(readings, "battery_cycle_count");
  const ssdHealth = latestMetric(readings, "ssd_health_percent");
  const ssdWear = latestMetric(readings, "ssd_wear_percent");
  const cpuTemp = latestMetric(readings, "cpu_temperature_c");
  const thermal = latestMetric(readings, "thermal_event");
  const ram = latestMetric(readings, "ram_usage_percent");
  const storage = latestMetric(readings, "storage_usage_percent");

  const batteryScores = [batteryHealth, batteryCycles].filter(Boolean).map((reading) => scoreFromStatus(evaluateTelemetryMetric(reading!.metricType, reading!.value)));
  const ssdScores = [ssdHealth, ssdWear].filter(Boolean).map((reading) => scoreFromStatus(evaluateTelemetryMetric(reading!.metricType, reading!.value)));
  const thermalScores = [cpuTemp, thermal].filter(Boolean).map((reading) => scoreFromStatus(evaluateTelemetryMetric(reading!.metricType, reading!.value)));
  const memoryScores = ram ? [scoreFromStatus(evaluateTelemetryMetric(ram.metricType, ram.value))] : [];
  const storageScores = storage ? [scoreFromStatus(evaluateTelemetryMetric(storage.metricType, storage.value))] : [];

  const weighted = [
    { key: "battery" as const, weight: 0.25, scores: batteryScores },
    { key: "ssd" as const, weight: 0.25, scores: ssdScores },
    { key: "thermal" as const, weight: 0.2, scores: thermalScores },
    { key: "memory" as const, weight: 0.15, scores: memoryScores },
    { key: "storage" as const, weight: 0.15, scores: storageScores },
  ].filter((entry) => entry.scores.length > 0);

  const healthScore = weighted.length
    ? Math.round(
        weighted.reduce((sum, entry) => sum + (entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length) * entry.weight, 0) /
          weighted.reduce((sum, entry) => sum + entry.weight, 0)
      )
    : device.healthScore;

  const analysis: DeviceHealthAnalysis = {
    deviceId,
    healthScore,
    riskLevel: scoreToRiskLevel(healthScore),
    factors: {
      ...(batteryScores.length
        ? { battery: { score: Math.round(batteryScores.reduce((a, b) => a + b, 0) / batteryScores.length), status: evaluateTelemetryMetric(batteryHealth?.metricType ?? "battery_health_percent", batteryHealth?.value ?? 0), metrics: { battery_health_percent: batteryHealth?.value, battery_cycle_count: batteryCycles?.value } } }
        : {}),
      ...(ssdScores.length
        ? { ssd: { score: Math.round(ssdScores.reduce((a, b) => a + b, 0) / ssdScores.length), status: evaluateTelemetryMetric(ssdHealth?.metricType ?? "ssd_health_percent", ssdHealth?.value ?? 0), metrics: { ssd_health_percent: ssdHealth?.value, ssd_wear_percent: ssdWear?.value } } }
        : {}),
      ...(thermalScores.length
        ? { thermal: { score: Math.round(thermalScores.reduce((a, b) => a + b, 0) / thermalScores.length), status: evaluateTelemetryMetric(cpuTemp?.metricType ?? "cpu_temperature_c", cpuTemp?.value ?? 0), metrics: { cpu_temperature_c: cpuTemp?.value, thermal_event: thermal?.value } } }
        : {}),
      ...(memoryScores.length
        ? { memory: { score: memoryScores[0], status: evaluateTelemetryMetric(ram?.metricType ?? "ram_usage_percent", ram?.value ?? 0), metrics: { ram_usage_percent: ram?.value } } }
        : {}),
      ...(storageScores.length
        ? { storage: { score: storageScores[0], status: evaluateTelemetryMetric(storage?.metricType ?? "storage_usage_percent", storage?.value ?? 0), metrics: { storage_usage_percent: storage?.value } } }
        : {}),
    },
    topRisks: [
      ...(cpuTemp && evaluateTelemetryMetric(cpuTemp.metricType, cpuTemp.value) !== "HEALTHY"
        ? [{ metric: cpuTemp.metricType, value: cpuTemp.value, severity: "HIGH" as const, message: "CPU temperature is elevated." }]
        : []),
      ...(batteryHealth && evaluateTelemetryMetric(batteryHealth.metricType, batteryHealth.value) !== "HEALTHY"
        ? [{ metric: batteryHealth.metricType, value: batteryHealth.value, severity: "WARNING" as const, message: "Battery health is declining." }]
        : []),
    ].slice(0, 3),
    recommendations: [
      "Check thermal conditions and ventilation.",
      "Review battery health and battery cycle count.",
    ],
  };

  return analysis;
}

/** GET /api/devices/:deviceId/health */
export function getDeviceHealth(deviceId: string, signal?: AbortSignal) {
  return apiRequest<DeviceHealthAnalysis>(`/devices/${deviceId}/health`, {
    method: "GET",
    signal,
    mockResolver: () => buildMockAnalysis(deviceId),
  });
}
