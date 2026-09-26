import { apiRequest } from "@/lib/apiClient";
import devicesMock from "@/mock/devices.json";
import type { Device, TelemetryQueryParams, TelemetryReading, TelemetryMetricType } from "@/types";
import {
  getTelemetryMetricConfig,
  normalizeTelemetryMetricType,
} from "@/services/telemetryService";

const MOCK_DEVICES = devicesMock as Device[];

function hashString(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getMockDevice(deviceId: string) {
  const device = MOCK_DEVICES.find((entry) => entry.id === deviceId);
  if (!device) {
    throw new Error(`Device ${deviceId} not found in mock telemetry source`);
  }
  return device;
}

function getMetricBaseValue(device: Device, metricType: TelemetryMetricType) {
  const healthPenalty = 100 - device.healthScore;
  const baseSeed = hashString(`${device.id}:${metricType}`) % 11;

  switch (normalizeTelemetryMetricType(metricType)) {
    case "battery_health_percent":
      return clamp(device.healthScore - baseSeed, 30, 100);
    case "battery_cycle_count":
      return clamp(120 + healthPenalty * 8 + baseSeed * 10, 80, 1000);
    case "ssd_health_percent":
      return clamp(device.healthScore - 2 + baseSeed, 35, 100);
    case "ssd_wear_percent":
      return clamp(100 - device.healthScore + baseSeed, 5, 90);
    case "cpu_temperature_c":
      return clamp(56 + healthPenalty * 0.45 + baseSeed * 0.4, 52, 96);
    case "thermal_event":
      return clamp(Math.round(healthPenalty / 20) + (device.riskLevel === "high" ? 2 : 0), 0, 8);
    case "ram_usage_percent":
      return clamp(50 + healthPenalty * 0.35 + baseSeed * 0.6, 30, 98);
    case "storage_usage_percent":
      return clamp(58 + healthPenalty * 0.3 + baseSeed * 0.5, 35, 99);
  }
}

function getMetricUnit(metricType: TelemetryMetricType) {
  return getTelemetryMetricConfig(metricType).unit;
}

function formatMockReadingValue(metricType: TelemetryMetricType, value: number) {
  const canonicalMetric = normalizeTelemetryMetricType(metricType);
  if (canonicalMetric === "battery_cycle_count" || canonicalMetric === "thermal_event") {
    return Math.round(value);
  }
  if (canonicalMetric === "cpu_temperature_c") {
    return Math.round(value * 10) / 10;
  }
  return Math.round(value);
}

function generateTelemetryHistory(device: Device, metricType: TelemetryMetricType, limit: number): TelemetryReading[] {
  const canonicalMetric = normalizeTelemetryMetricType(metricType);
  const baseValue = getMetricBaseValue(device, metricType);
  const direction = device.healthScore < 70 ? 1 : -1;
  const now = Date.now();

  return Array.from({ length: limit }, (_, index) => {
    const age = limit - index - 1;
    const wobble = Math.sin((hashString(device.id) + age * 7) / 6) * (canonicalMetric === "cpu_temperature_c" ? 2 : 4);
    const trend = direction * age * (canonicalMetric === "battery_cycle_count" ? 4 : 0.7);
    const value = formatMockReadingValue(metricType, clamp(baseValue + wobble + trend, 0, 1000));

    return {
      id: `${device.id}-${canonicalMetric}-${index}`,
      deviceId: device.id,
      metricType: canonicalMetric,
      value,
      unit: getMetricUnit(metricType),
      source: "demo_simulated" as const,
      recordedAt: new Date(now - age * 30 * 60 * 1000).toISOString(),
    };
  }).reverse();
}

export function createMockTelemetryReadings(deviceId: string, params: TelemetryQueryParams = {}): TelemetryReading[] {
  const device = getMockDevice(deviceId);
  const metricType = params.metricType ? normalizeTelemetryMetricType(params.metricType) : undefined;
  const limit = params.limit ?? 100;

  if (metricType) {
    return generateTelemetryHistory(device, metricType, limit);
  }

  const metrics: TelemetryMetricType[] = [
    "battery_health_percent",
    "battery_cycle_count",
    "ssd_health_percent",
    "ssd_wear_percent",
    "cpu_temperature_c",
    "thermal_event",
    "ram_usage_percent",
    "storage_usage_percent",
  ];

  return metrics.slice(0, limit).map((metric, index) => {
    const value = formatMockReadingValue(metric, getMetricBaseValue(device, metric));
    return {
      id: `${device.id}-${metric}`,
      deviceId: device.id,
      metricType: metric,
      value,
      unit: getMetricUnit(metric),
      source: "demo_simulated" as const,
      recordedAt: new Date(Date.parse(device.lastCheckedAt) - index * 60 * 1000).toISOString(),
    };
  });
}

/** GET /api/telemetry/:deviceId */
export async function getDeviceTelemetry(deviceId: string, params: TelemetryQueryParams = {}, signal?: AbortSignal) {
  const normalizedMetricType = params.metricType ? normalizeTelemetryMetricType(params.metricType) : undefined;
  const query = new URLSearchParams({
    ...(normalizedMetricType ? { metricType: normalizedMetricType } : {}),
    ...(params.limit ? { limit: String(params.limit) } : {}),
  }).toString();

  const res = await apiRequest<TelemetryReading[] | { data: TelemetryReading[] }>(`/telemetry/${deviceId}${query ? `?${query}` : ""}`, {
    method: "GET",
    signal,
    mockResolver: () => createMockTelemetryReadings(deviceId, params),
  });

  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as { data?: TelemetryReading[] }).data)) return (res as { data: TelemetryReading[] }).data;
  return [];
}

/** POST /api/telemetry */
export function postTelemetry(data: { deviceId: string; source?: string; readings: Array<{ metricType: TelemetryMetricType; value: number; unit?: string; recordedAt?: string }> }) {
  return apiRequest<{ success: boolean; deviceId: string; readingsStored: number; timestamp: string }>("/telemetry", {
    method: "POST",
    body: data,
    mockResolver: () => ({
      success: true,
      deviceId: data.deviceId,
      readingsStored: data.readings.length,
      timestamp: new Date().toISOString(),
    }),
  });
}
