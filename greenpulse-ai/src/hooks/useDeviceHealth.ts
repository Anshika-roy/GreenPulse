import { useQuery } from "@tanstack/react-query";
import { getDeviceHealth } from "@/api/deviceHealth";

export const deviceHealthKeys = {
  all: ["device-health"] as const,
  detail: (deviceId: string) => ["device-health", deviceId] as const,
};

export function useDeviceHealth(deviceId: string | undefined) {
  return useQuery({
    queryKey: deviceHealthKeys.detail(deviceId ?? ""),
    queryFn: ({ signal }) => getDeviceHealth(deviceId as string, signal),
    enabled: Boolean(deviceId),
    retry: false,
  });
}
