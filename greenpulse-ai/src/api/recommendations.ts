import { apiRequest } from "@/lib/apiClient";
import type { PredictionRequest, PredictionResponse, Recommendation } from "@/types";
import devicesMock from "@/mock/devices.json";
import type { Device } from "@/types";

const ALL_DEVICES = devicesMock as Device[];

/** GET /api/recommendations */
export function getRecommendations(signal?: AbortSignal) {
  return apiRequest<Recommendation[]>("/recommendations", {
    method: "GET",
    signal,
    mockResolver: (): Recommendation[] =>
      ALL_DEVICES.filter((d) => d.riskLevel !== "low")
        .slice(0, 10)
        .map((d) => ({
          id: `rec-${d.id}`,
          deviceId: d.id,
          action: d.recommendation.action,
          rationale: `${d.issue.label} detected with ${d.aiConfidence}% confidence.`,
          confidence: d.aiConfidence,
          potentialSavingsInr: Math.round((100 - d.healthScore) * 350),
        })),
  });
}

/** POST /api/predict */
export function predictDeviceFailure(req: PredictionRequest) {
  return apiRequest<PredictionResponse>("/predict", {
    method: "POST",
    body: req,
    mockLatency: [500, 900],
    mockResolver: (): PredictionResponse => {
      const device = ALL_DEVICES.find((d) => d.id === req.deviceId);
      if (!device) throw new Error(`Device ${req.deviceId} not found`);
      return {
        deviceId: device.id,
        riskLevel: device.riskLevel,
        confidence: device.aiConfidence,
        predictedFailureWindowDays:
          device.riskLevel === "high" ? 14 : device.riskLevel === "medium" ? 45 : 120,
        contributingFactors: [device.issue.label, "Usage intensity", "Device age"],
      };
    },
  });
}
