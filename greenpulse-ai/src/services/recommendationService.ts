import { getRecommendations, predictDeviceFailure } from "@/api/recommendations";

export const recommendationService = {
  async list(signal?: AbortSignal) {
    return getRecommendations(signal);
  },
  async predict(deviceId: string) {
    return predictDeviceFailure({ deviceId });
  },
};
