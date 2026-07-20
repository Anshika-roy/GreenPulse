import { apiRequest } from "@/lib/apiClient";
import type { Device, DeviceListParams, DeviceListResponse } from "@/types";
import devicesMock from "@/mock/devices.json";

const ALL_DEVICES = devicesMock as Device[];

function applyMockQuery(params: DeviceListParams): DeviceListResponse {
  let rows = [...ALL_DEVICES];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (d) =>
        d.model.toLowerCase().includes(q) ||
        d.assetTag.toLowerCase().includes(q) ||
        d.issue.label.toLowerCase().includes(q)
    );
  }

  if (params.riskLevel && params.riskLevel !== "all") {
    rows = rows.filter((d) => d.riskLevel === params.riskLevel);
  }

  if (params.category && params.category !== "all") {
    rows = rows.filter((d) => d.category === params.category);
  }

  if (params.sortBy) {
    const dir = params.sortDir === "desc" ? -1 : 1;
    rows.sort((a, b) => {
      const key = params.sortBy === "health" ? "healthScore" : params.sortBy!;
      const av = (a as unknown as Record<string, unknown>)[key as string];
      const bv = (b as unknown as Record<string, unknown>)[key as string];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  const total = rows.length;
  const start = (params.page - 1) * params.pageSize;
  const paged = rows.slice(start, start + params.pageSize);

  return { data: paged, total, page: params.page, pageSize: params.pageSize };
}

/** GET /api/devices */
export function getDevices(params: DeviceListParams, signal?: AbortSignal) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    ...(params.search ? { search: params.search } : {}),
    ...(params.riskLevel ? { riskLevel: params.riskLevel } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.sortBy ? { sortBy: String(params.sortBy) } : {}),
    ...(params.sortDir ? { sortDir: params.sortDir } : {}),
  }).toString();

  return apiRequest<DeviceListResponse>(`/devices?${query}`, {
    method: "GET",
    signal,
    mockResolver: () => applyMockQuery(params),
  });
}

/** GET /api/devices/:id */
export function getDeviceById(id: string, signal?: AbortSignal) {
  return apiRequest<Device>(`/devices/${id}`, {
    method: "GET",
    signal,
    mockResolver: () => {
      const device = ALL_DEVICES.find((d) => d.id === id);
      if (!device) throw new Error(`Device ${id} not found`);
      return device;
    },
  });
}
