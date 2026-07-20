export type RiskLevel = "high" | "medium" | "low";
export type DeviceCategory = "laptop" | "desktop" | "monitor" | "printer" | "mobile" | "server";
export type DeviceStatus = "active" | "in-repair" | "retired" | "in-storage";

export interface DeviceIssue {
  code: string;
  label: string;
  detectedAt: string; // ISO date
}

export interface DeviceRecommendation {
  action: string; // e.g. "Replace in 14 days"
  actionType: "replace" | "backup-replace" | "clean-check" | "diagnostics" | "schedule-service" | "monitor";
  etaDate: string; // ISO date
  confidence: number; // 0-100
}

export interface Device {
  id: string;
  assetTag: string; // e.g. LAP-IT-1021
  model: string; // e.g. ThinkPad T14 Gen 3
  category: DeviceCategory;
  status: DeviceStatus;
  healthScore: number; // 0-100
  riskLevel: RiskLevel;
  issue: DeviceIssue;
  aiConfidence: number; // 0-100
  recommendation: DeviceRecommendation;
  owner?: {
    name: string;
    department: string;
  };
  location?: string;
  purchaseDate?: string;
  warrantyExpiresAt?: string;
  healthHistory: number[]; // sparkline series
  lastCheckedAt: string;
}

export interface DeviceListParams {
  page: number;
  pageSize: number;
  search?: string;
  riskLevel?: RiskLevel | "all";
  category?: DeviceCategory | "all";
  sortBy?: keyof Device | "health" | "risk";
  sortDir?: "asc" | "desc";
}

export interface DeviceListResponse {
  data: Device[];
  total: number;
  page: number;
  pageSize: number;
}
