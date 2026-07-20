export interface ActionPlanSummary {
  devicesAnalyzed: number;
  summaryText: string;
  estimatedSavingsInr: number;
  ewastePreventedKg: number;
  quickWins: { icon: "battery" | "check" | "warranty"; label: string }[];
}

export interface FleetTrendPoint {
  date: string;
  value: number;
}

export interface FleetHealthStat {
  score: number;
  deltaVsLastWeek: number;
  trend: FleetTrendPoint[];
}

export interface CriticalDevicesStat {
  count: number;
  percentOfFleet: number;
  trend: FleetTrendPoint[];
}

export interface RepairCostStat {
  amountInrLakhs: number;
  horizonLabel: string;
  trend: FleetTrendPoint[];
}

export interface SustainabilityStat {
  ewastePreventedKg: number;
  co2AvoidedKg: number;
}

export interface DashboardSummary {
  userName: string;
  dateLabel: string;
  actionPlan: ActionPlanSummary;
  fleetHealth: FleetHealthStat;
  criticalDevices: CriticalDevicesStat;
  repairCost: RepairCostStat;
  sustainability: SustainabilityStat;
}
