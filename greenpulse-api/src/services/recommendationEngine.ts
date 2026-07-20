import type { Device } from "@prisma/client";

/**
 * Rule-based recommendation/prediction engine — a placeholder for a real ML
 * model. Swap `scoreDevice` for a call to your trained model or an external
 * inference service; the rest of the pipeline (endpoints, DTOs) stays the same.
 */
export function scoreDevice(device: Device) {
  const riskLevel = device.healthScore < 60 ? "high" : device.healthScore < 80 ? "medium" : "low";
  const predictedFailureWindowDays = riskLevel === "high" ? 14 : riskLevel === "medium" ? 45 : 120;

  return {
    riskLevel,
    confidence: device.aiConfidence,
    predictedFailureWindowDays,
    contributingFactors: [device.issueLabel, "Usage intensity", "Device age"],
  };
}

export function estimateSavings(device: Device): number {
  return Math.round((100 - device.healthScore) * 350);
}
