import { getDeviceTelemetry } from "./telemetryService";

type HealthStatus = "HEALTHY" | "WARNING" | "HIGH_RISK" | "CRITICAL";
type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type TelemetryReadingDto = Awaited<ReturnType<typeof getDeviceTelemetry>>[number];

type MetricStatus = {
  score: number;
  status: HealthStatus;
  message: string;
};

type FactorAnalysis = {
  score: number;
  status: HealthStatus;
  metrics: Record<string, number | undefined>;
};

export interface HealthRisk {
  metric: string;
  value: number;
  severity: "WARNING" | "HIGH" | "CRITICAL";
  message: string;
}

export interface DeviceHealthAnalysis {
  deviceId: string;
  healthScore: number;
  riskLevel: RiskLevel;
  factors: {
    battery?: FactorAnalysis;
    ssd?: FactorAnalysis;
    thermal?: FactorAnalysis;
    memory?: FactorAnalysis;
    storage?: FactorAnalysis;
  };
  topRisks: HealthRisk[];
  recommendations: string[];
  failureProbabilityPercent: number;
  predictedRiskTier: string;
  topRiskDriver: string;
  actionWindowDays: number;
}

const FACTOR_WEIGHTS = {
  battery: 0.25,
  ssd: 0.25,
  thermal: 0.2,
  memory: 0.15,
  storage: 0.15,
} as const;

const FACTOR_STATUS_ORDER: Record<HealthStatus, number> = {
  HEALTHY: 0,
  WARNING: 1,
  HIGH_RISK: 2,
  CRITICAL: 3,
};

const COMPONENT_SCORE_BY_STATUS: Record<HealthStatus, number> = {
  HEALTHY: 100,
  WARNING: 80,
  HIGH_RISK: 50,
  CRITICAL: 10,
};

const COMPONENT_SEVERITY_BY_STATUS: Record<Exclude<HealthStatus, "HEALTHY">, "WARNING" | "HIGH" | "CRITICAL"> = {
  WARNING: "WARNING",
  HIGH_RISK: "HIGH",
  CRITICAL: "CRITICAL",
};

const RISK_LEVEL_BY_SCORE: Array<{ min: number; level: RiskLevel }> = [
  { min: 85, level: "LOW" },
  { min: 70, level: "MEDIUM" },
  { min: 55, level: "HIGH" },
  { min: 0, level: "CRITICAL" },
];

function scoreToStatus(score: number): HealthStatus {
  if (score >= 80) return "HEALTHY";
  if (score >= 60) return "WARNING";
  if (score >= 40) return "HIGH_RISK";
  return "CRITICAL";
}

function scoreToRiskLevel(score: number): RiskLevel {
  return RISK_LEVEL_BY_SCORE.find((entry) => score >= entry.min)?.level ?? "CRITICAL";
}

function roundScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function statusFromThresholds(
  value: number,
  thresholds: Array<{ min?: number; max?: number; status: HealthStatus }>
): MetricStatus {
  const match = thresholds.find((threshold) => {
    const minOk = threshold.min === undefined || value >= threshold.min;
    const maxOk = threshold.max === undefined || value <= threshold.max;
    return minOk && maxOk;
  });

  const status = match?.status ?? "CRITICAL";
  return {
    score: COMPONENT_SCORE_BY_STATUS[status],
    status,
    message: status,
  };
}

function latestValue(readings: TelemetryReadingDto[], metricType: string) {
  return readings.find((reading) => reading.metricType === metricType)?.value;
}

function normalizeMetricType(metricType: string) {
  return metricType === "thermal_event_count" ? "thermal_event" : metricType;
}

function componentRisk(metric: string, value: number, status: Exclude<HealthStatus, "HEALTHY">): HealthRisk {
  const normalizedMetric = normalizeMetricType(metric);
  const severity = COMPONENT_SEVERITY_BY_STATUS[status];
  const messages: Record<string, Record<typeof severity, string>> = {
    battery_health_percent: {
      WARNING: "Battery health is beginning to degrade.",
      HIGH: "Battery health is low.",
      CRITICAL: "Battery health is critically low.",
    },
    battery_cycle_count: {
      WARNING: "Battery cycle count is rising.",
      HIGH: "Battery cycle count is high.",
      CRITICAL: "Battery cycle count is critically high.",
    },
    ssd_health_percent: {
      WARNING: "SSD health is beginning to degrade.",
      HIGH: "SSD health is low.",
      CRITICAL: "SSD health is critically low.",
    },
    ssd_wear_percent: {
      WARNING: "SSD wear is increasing.",
      HIGH: "SSD wear is high.",
      CRITICAL: "SSD wear is critically high.",
    },
    cpu_temperature_c: {
      WARNING: "CPU temperature is elevated.",
      HIGH: "CPU temperature is high.",
      CRITICAL: "CPU temperature is critically high.",
    },
    thermal_event: {
      WARNING: "Thermal events are appearing.",
      HIGH: "Thermal events are frequent.",
      CRITICAL: "Thermal events are severe.",
    },
    ram_usage_percent: {
      WARNING: "RAM usage is elevated.",
      HIGH: "RAM usage is high.",
      CRITICAL: "RAM usage is critically high.",
    },
    storage_usage_percent: {
      WARNING: "Storage usage is elevated.",
      HIGH: "Storage usage is high.",
      CRITICAL: "Storage usage is critically high.",
    },
  };

  return {
    metric: normalizedMetric,
    value,
    severity,
    message: messages[normalizedMetric]?.[severity] ?? "Telemetry indicates elevated risk.",
  };
}

function weightedAverage(items: Array<{ score: number; weight: number }>) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return 0;
  return items.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight;
}

function aggregateFactor(scores: Array<{ score: number; weight: number }>, metrics: Record<string, number | undefined>): FactorAnalysis | undefined {
  const present = scores.filter((item) => Number.isFinite(item.score));
  if (!present.length) return undefined;

  const score = roundScore(weightedAverage(present));
  return {
    score,
    status: scoreToStatus(score),
    metrics,
  };
}

function metricAssessment(metricType: string, value: number): MetricStatus | undefined {
  metricType = normalizeMetricType(metricType);
  switch (metricType) {
    case "battery_health_percent":
      return statusFromThresholds(value, [
        { min: 80, status: "HEALTHY" },
        { min: 60, max: 79, status: "WARNING" },
        { min: 40, max: 59, status: "HIGH_RISK" },
        { max: 39, status: "CRITICAL" },
      ]);
    case "battery_cycle_count":
      return statusFromThresholds(value, [
        { max: 299, status: "HEALTHY" },
        { min: 300, max: 599, status: "WARNING" },
        { min: 600, max: 899, status: "HIGH_RISK" },
        { min: 900, status: "CRITICAL" },
      ]);
    case "ssd_health_percent":
      return statusFromThresholds(value, [
        { min: 85, status: "HEALTHY" },
        { min: 70, max: 84, status: "WARNING" },
        { min: 50, max: 69, status: "HIGH_RISK" },
        { max: 49, status: "CRITICAL" },
      ]);
    case "ssd_wear_percent":
      return statusFromThresholds(value, [
        { max: 19, status: "HEALTHY" },
        { min: 20, max: 40, status: "WARNING" },
        { min: 41, max: 60, status: "HIGH_RISK" },
        { min: 61, status: "CRITICAL" },
      ]);
    case "cpu_temperature_c":
      return statusFromThresholds(value, [
        { max: 69, status: "HEALTHY" },
        { min: 70, max: 80, status: "WARNING" },
        { min: 81, max: 90, status: "HIGH_RISK" },
        { min: 91, status: "CRITICAL" },
      ]);
    case "thermal_event":
      return statusFromThresholds(value, [
        { max: 0, status: "HEALTHY" },
        { min: 1, max: 2, status: "WARNING" },
        { min: 3, max: 5, status: "HIGH_RISK" },
        { min: 6, status: "CRITICAL" },
      ]);
    case "ram_usage_percent":
      return statusFromThresholds(value, [
        { max: 69, status: "HEALTHY" },
        { min: 70, max: 85, status: "WARNING" },
        { min: 86, max: 95, status: "HIGH_RISK" },
        { min: 96, status: "CRITICAL" },
      ]);
    case "storage_usage_percent":
      return statusFromThresholds(value, [
        { max: 69, status: "HEALTHY" },
        { min: 70, max: 85, status: "WARNING" },
        { min: 86, max: 95, status: "HIGH_RISK" },
        { min: 96, status: "CRITICAL" },
      ]);
    default:
      return undefined;
  }
}

export function analyzeDeviceHealth(deviceId: string, readings: TelemetryReadingDto[]): DeviceHealthAnalysis {
  const latestReadings = new Map<string, TelemetryReadingDto>();
  for (const reading of readings) {
    if (!latestReadings.has(reading.metricType)) {
      latestReadings.set(reading.metricType, reading);
    }
  }

  const batteryHealth = latestValue(readings, "battery_health_percent");
  const batteryCycleCount = latestValue(readings, "battery_cycle_count");
  const ssdHealth = latestValue(readings, "ssd_health_percent");
  const ssdWear = latestValue(readings, "ssd_wear_percent");
  const cpuTemperature = latestValue(readings, "cpu_temperature_c");
  const thermalEvents = latestValue(readings, "thermal_event");
  const ramUsage = latestValue(readings, "ram_usage_percent");
  const storageUsage = latestValue(readings, "storage_usage_percent");

  const battery = aggregateFactor(
    [
      batteryHealth === undefined ? undefined : { score: metricAssessment("battery_health_percent", batteryHealth)!.score, weight: 0.7 },
      batteryCycleCount === undefined ? undefined : { score: metricAssessment("battery_cycle_count", batteryCycleCount)!.score, weight: 0.3 },
    ].filter(Boolean) as Array<{ score: number; weight: number }>,
    {
      battery_health_percent: batteryHealth,
      battery_cycle_count: batteryCycleCount,
    }
  );

  const ssd = aggregateFactor(
    [
      ssdHealth === undefined ? undefined : { score: metricAssessment("ssd_health_percent", ssdHealth)!.score, weight: 0.6 },
      ssdWear === undefined ? undefined : { score: metricAssessment("ssd_wear_percent", ssdWear)!.score, weight: 0.4 },
    ].filter(Boolean) as Array<{ score: number; weight: number }>,
    {
      ssd_health_percent: ssdHealth,
      ssd_wear_percent: ssdWear,
    }
  );

  const thermal = aggregateFactor(
    [
      cpuTemperature === undefined ? undefined : { score: metricAssessment("cpu_temperature_c", cpuTemperature)!.score, weight: 0.85 },
      thermalEvents === undefined ? undefined : { score: metricAssessment("thermal_event", thermalEvents)!.score, weight: 0.15 },
    ].filter(Boolean) as Array<{ score: number; weight: number }>,
    {
      cpu_temperature_c: cpuTemperature,
      thermal_event: thermalEvents,
    }
  );

  const memory = ramUsage === undefined
    ? undefined
    : aggregateFactor([{ score: metricAssessment("ram_usage_percent", ramUsage)!.score, weight: 1 }], { ram_usage_percent: ramUsage });

  const storage = storageUsage === undefined
    ? undefined
    : aggregateFactor([{ score: metricAssessment("storage_usage_percent", storageUsage)!.score, weight: 1 }], { storage_usage_percent: storageUsage });

  const factorEntries: Array<{ factor: FactorAnalysis; weight: number }> = [];
  if (battery) factorEntries.push({ factor: battery, weight: FACTOR_WEIGHTS.battery });
  if (ssd) factorEntries.push({ factor: ssd, weight: FACTOR_WEIGHTS.ssd });
  if (thermal) factorEntries.push({ factor: thermal, weight: FACTOR_WEIGHTS.thermal });
  if (memory) factorEntries.push({ factor: memory, weight: FACTOR_WEIGHTS.memory });
  if (storage) factorEntries.push({ factor: storage, weight: FACTOR_WEIGHTS.storage });

  const healthScore = factorEntries.length
    ? roundScore(weightedAverage(factorEntries.map((entry) => ({ score: entry.factor.score, weight: entry.weight }))))
    : 0;

  const risks: HealthRisk[] = [];
  const addRisk = (metricType: string, rawValue: number | undefined) => {
    if (rawValue === undefined) return;
    const assessment = metricAssessment(metricType, rawValue);
    if (!assessment || assessment.status === "HEALTHY") return;
    risks.push(componentRisk(metricType, rawValue, assessment.status));
  };

  addRisk("battery_health_percent", batteryHealth);
  addRisk("battery_cycle_count", batteryCycleCount);
  addRisk("ssd_health_percent", ssdHealth);
  addRisk("ssd_wear_percent", ssdWear);
  addRisk("cpu_temperature_c", cpuTemperature);
  addRisk("thermal_event", thermalEvents);
  addRisk("ram_usage_percent", ramUsage);
  addRisk("storage_usage_percent", storageUsage);

  risks.sort((left, right) => {
    const leftStatus = metricAssessment(left.metric, left.value)?.status ?? "HEALTHY";
    const rightStatus = metricAssessment(right.metric, right.value)?.status ?? "HEALTHY";
    const severityDiff = FACTOR_STATUS_ORDER[rightStatus] - FACTOR_STATUS_ORDER[leftStatus];
    if (severityDiff !== 0) return severityDiff;
    return left.value - right.value;
  });

  const recommendations = Array.from(
    new Set(
      risks.map((risk) => {
        switch (risk.metric) {
          case "battery_health_percent":
          case "battery_cycle_count":
            return "Inspect battery health and plan replacement if degradation continues.";
          case "ssd_health_percent":
          case "ssd_wear_percent":
            return "Back up data and schedule SSD maintenance or replacement.";
          case "cpu_temperature_c":
          case "thermal_event":
            return "Check thermal conditions, clean vents, and verify fan performance.";
          case "ram_usage_percent":
            return "Reduce memory pressure or consider a RAM upgrade.";
          case "storage_usage_percent":
            return "Free up storage space or expand device capacity.";
          default:
            return "Review device telemetry for emerging issues.";
        }
      })
    )
  ).slice(0, 5);

  const topRisks = risks.slice(0, 3);

  // Compute logistic failure probability using trained scikit-learn pipeline weights
  const featureValues: Record<string, number> = {
    cpu_usage_percent: latestValue(readings, "cpu_usage_percent") ?? 45,
    ram_usage_percent: ramUsage ?? 50,
    cpu_temperature_c: cpuTemperature ?? 55,
    storage_usage_percent: storageUsage ?? 55,
    ssd_wear_percent: ssdWear ?? 15,
    battery_health_percent: batteryHealth ?? 90,
    health_score: healthScore,
  };

  // Evaluate normalized logit using learned weights from models/greenpulse-risk-v1.json
  const trainedMeans = [47.66, 57.88, 63.43, 57.48, 49.09, 67.07, 59.78];
  const trainedStds = [18.16, 15.96, 9.45, 24.54, 27.80, 19.04, 10.72];
  const trainedWeights = [0.0758, -0.0292, 0.2085, -0.0937, 0.7318, -0.5649, -0.8929];
  const trainedIntercept = -2.5384;

  const normalizedFeatures = [
    (featureValues.cpu_usage_percent - trainedMeans[0]) / trainedStds[0],
    (featureValues.ram_usage_percent - trainedMeans[1]) / trainedStds[1],
    (featureValues.cpu_temperature_c - trainedMeans[2]) / trainedStds[2],
    (featureValues.storage_usage_percent - trainedMeans[3]) / trainedStds[3],
    (featureValues.ssd_wear_percent - trainedMeans[4]) / trainedStds[4],
    (featureValues.battery_health_percent - trainedMeans[5]) / trainedStds[5],
    (featureValues.health_score - trainedMeans[6]) / trainedStds[6],
  ];

  let z = trainedIntercept;
  normalizedFeatures.forEach((normVal, idx) => {
    z += trainedWeights[idx] * normVal;
  });

  const failureProbabilityPercent = Math.round((1 / (1 + Math.exp(-z))) * 100);
  const calculatedRiskLevel = scoreToRiskLevel(healthScore);
  const actionWindowDays = calculatedRiskLevel === "CRITICAL" || calculatedRiskLevel === "HIGH" ? 14 : calculatedRiskLevel === "MEDIUM" ? 45 : 120;

  const drivers = [
    { feature: "SSD Wear Level High", impact: Math.abs(normalizedFeatures[4] * trainedWeights[4]) },
    { feature: "Low Health Score Composite", impact: Math.abs(normalizedFeatures[6] * trainedWeights[6]) },
    { feature: "Battery Capacity Degradation", impact: Math.abs(normalizedFeatures[5] * trainedWeights[5]) },
    { feature: "CPU Thermal Overheating", impact: Math.abs(normalizedFeatures[2] * trainedWeights[2]) },
  ];
  drivers.sort((a, b) => b.impact - a.impact);

  return {
    deviceId,
    healthScore,
    riskLevel: calculatedRiskLevel,
    factors: {
      ...(battery ? { battery } : {}),
      ...(ssd ? { ssd } : {}),
      ...(thermal ? { thermal } : {}),
      ...(memory ? { memory } : {}),
      ...(storage ? { storage } : {}),
    },
    topRisks,
    recommendations,
    failureProbabilityPercent,
    predictedRiskTier: failureProbabilityPercent > 70 ? "CRITICAL" : failureProbabilityPercent > 45 ? "HIGH" : failureProbabilityPercent > 20 ? "MEDIUM" : "LOW",
    topRiskDriver: drivers[0]?.feature || "Normal Telemetry Baseline",
    actionWindowDays,
  };
}