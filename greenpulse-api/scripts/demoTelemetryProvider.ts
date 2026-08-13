import "dotenv/config";

type TelemetrySource = "real_agent" | "demo_simulated";
type TelemetryProfile = "healthy" | "aging" | "at-risk";

type LoginResponse = {
  token: string;
};

type DeviceListResponse = {
  data: Array<{ id: string }>;
};

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000";
const DEMO_EMAIL = "rohit.sharma@acmeglobal.com";
const DEMO_PASSWORD = "password123";
const DEMO_DEVICE_ID = process.env.DEMO_TELEMETRY_DEVICE_ID;
const DEMO_PROFILE = parseProfile(process.argv.slice(2));

function parseProfile(args: string[]): TelemetryProfile {
  const candidate = args.find((arg) => !arg.startsWith("-"))?.toLowerCase();
  if (candidate === "aging" || candidate === "at-risk") {
    return candidate;
  }
  return "healthy";
}

function telemetryBatch(profile: TelemetryProfile, source: TelemetrySource) {
  const now = new Date();
  const recordedAt = now.toISOString();

  const profiles: Record<TelemetryProfile, Array<{ metricType: string; value: number; unit: string }>> = {
    healthy: [
      { metricType: "battery_health_percent", value: 92, unit: "%" },
      { metricType: "battery_cycle_count", value: 140, unit: "cycles" },
      { metricType: "cpu_temperature_c", value: 58, unit: "C" },
      { metricType: "thermal_event", value: 0, unit: "count" },
      { metricType: "ssd_wear_percent", value: 12, unit: "%" },
      { metricType: "ssd_health_percent", value: 93, unit: "%" },
      { metricType: "ram_usage_percent", value: 42, unit: "%" },
      { metricType: "storage_usage_percent", value: 51, unit: "%" },
    ],
    aging: [
      { metricType: "battery_health_percent", value: 78, unit: "%" },
      { metricType: "battery_cycle_count", value: 460, unit: "cycles" },
      { metricType: "cpu_temperature_c", value: 68, unit: "C" },
      { metricType: "thermal_event", value: 1, unit: "count" },
      { metricType: "ssd_wear_percent", value: 29, unit: "%" },
      { metricType: "ssd_health_percent", value: 81, unit: "%" },
      { metricType: "ram_usage_percent", value: 79, unit: "%" },
      { metricType: "storage_usage_percent", value: 74, unit: "%" },
    ],
    "at-risk": [
      { metricType: "battery_health_percent", value: 54, unit: "%" },
      { metricType: "battery_cycle_count", value: 930, unit: "cycles" },
      { metricType: "cpu_temperature_c", value: 79, unit: "C" },
      { metricType: "thermal_event", value: 4, unit: "count" },
      { metricType: "ssd_wear_percent", value: 47, unit: "%" },
      { metricType: "ssd_health_percent", value: 66, unit: "%" },
      { metricType: "ram_usage_percent", value: 90, unit: "%" },
      { metricType: "storage_usage_percent", value: 88, unit: "%" },
    ],
  };

  return profiles[profile].map((reading) => ({ ...reading, recordedAt, source }));
}

async function login(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });

  if (!response.ok) {
    throw new Error(`Login failed (${response.status} ${response.statusText})`);
  }

  const data = (await response.json()) as LoginResponse;
  if (!data.token) {
    throw new Error("Login response did not include a token");
  }

  return data.token;
}

async function resolveDeviceId(token: string): Promise<string> {
  if (DEMO_DEVICE_ID) {
    return DEMO_DEVICE_ID;
  }

  const response = await fetch(`${API_BASE_URL}/api/devices?page=1&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Device lookup failed (${response.status} ${response.statusText})`);
  }

  const data = (await response.json()) as DeviceListResponse;
  const firstDevice = data.data[0];

  if (!firstDevice?.id) {
    throw new Error("No devices found for the demo company");
  }

  return firstDevice.id;
}

async function postTelemetry(token: string, deviceId: string) {
  const response = await fetch(`${API_BASE_URL}/api/telemetry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      deviceId,
      source: "demo_simulated",
      readings: telemetryBatch(DEMO_PROFILE, "demo_simulated"),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telemetry post failed (${response.status} ${response.statusText}): ${body}`);
  }

  return response.json() as Promise<{ success: boolean; deviceId: string; readingsStored: number; timestamp: string }>;
}

async function main() {
  const token = await login();
  const deviceId = await resolveDeviceId(token);
  const result = await postTelemetry(token, deviceId);

  console.log(
    `Posted ${result.readingsStored} ${DEMO_PROFILE} demo telemetry readings for device ${result.deviceId} at ${result.timestamp}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});