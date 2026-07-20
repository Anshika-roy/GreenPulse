import { getDevices, getDeviceById } from "@/api/devices";
import type { Device, DeviceListParams, RiskLevel } from "@/types";

export const deviceService = {
  async list(params: DeviceListParams, signal?: AbortSignal) {
    return getDevices(params, signal);
  },
  async getById(id: string, signal?: AbortSignal) {
    return getDeviceById(id, signal);
  },
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** Health score -> semantic risk color bucket, used for progress bars/badges. */
export function healthToRiskLevel(healthScore: number): RiskLevel {
  if (healthScore < 60) return "high";
  if (healthScore < 80) return "medium";
  return "low";
}

export function formatEta(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function deviceDisplayName(device: Device): { title: string; subtitle: string } {
  return { title: device.model, subtitle: device.assetTag };
}
