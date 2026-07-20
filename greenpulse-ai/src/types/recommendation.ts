export interface Recommendation {
  id: string;
  deviceId: string;
  action: string;
  rationale: string;
  confidence: number;
  potentialSavingsInr: number;
}

export interface PredictionRequest {
  deviceId: string;
}

export interface PredictionResponse {
  deviceId: string;
  riskLevel: "high" | "medium" | "low";
  confidence: number;
  predictedFailureWindowDays: number;
  contributingFactors: string[];
}
