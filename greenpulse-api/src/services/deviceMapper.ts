import type { Device, DeviceHealthPoint } from "@prisma/client";

type DeviceWithHistory = Device & { healthHistory?: DeviceHealthPoint[] };

/** Reshapes the flat Prisma Device row (+ optional health history) into the nested DTO the frontend expects. */
export function toDeviceDto(device: DeviceWithHistory) {
  return {
    id: device.id,
    assetTag: device.assetTag,
    model: device.model,
    category: device.category,
    status: device.status.replace("_", "-"),
    healthScore: device.healthScore,
    riskLevel: device.riskLevel,
    issue: {
      code: device.issueCode,
      label: device.issueLabel,
      detectedAt: device.issueDetectedAt.toISOString(),
    },
    aiConfidence: device.aiConfidence,
    recommendation: {
      action: device.recommendedAction,
      actionType: device.recommendedType.replace("_", "-"),
      etaDate: device.recommendedEta.toISOString(),
      confidence: device.aiConfidence,
    },
    owner:
      device.ownerName && device.ownerDepartment
        ? { name: device.ownerName, department: device.ownerDepartment }
        : undefined,
    location: device.location ?? undefined,
    purchaseDate: device.purchaseDate?.toISOString(),
    warrantyExpiresAt: device.warrantyExpiresAt?.toISOString(),
    healthHistory: device.healthHistory?.map((h) => h.value) ?? [],
    lastCheckedAt: device.lastCheckedAt.toISOString(),
  };
}
