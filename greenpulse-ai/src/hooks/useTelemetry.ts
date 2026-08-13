import { useQuery } from "@tanstack/react-query";
import { getDeviceTelemetry } from "@/api/telemetry";
import type { TelemetryQueryParams } from "@/types";

export const telemetryKeys = {
  all: ["telemetry"] as const,
  device: (deviceId: string, params: TelemetryQueryParams) => ["telemetry", deviceId, params] as const,
};

export function useTelemetry(deviceId: string | undefined, params: TelemetryQueryParams = {}) {
  return useQuery({
    queryKey: telemetryKeys.device(deviceId ?? "", params),
    queryFn: ({ signal }) => getDeviceTelemetry(deviceId as string, params, signal),
    enabled: Boolean(deviceId),
    retry: false,
  });
}
