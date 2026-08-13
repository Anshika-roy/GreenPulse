import type { TelemetryReading, TelemetrySource } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";

export interface TelemetryReadingInput {
  metricType: string;
  value: number;
  unit?: string;
  recordedAt?: Date;
  source?: TelemetrySource;
}

/** Confirms the device exists and belongs to the caller's company. Throws 404 otherwise (same convention as deviceController.getDeviceById — "not found" and "not yours" are indistinguishable to the caller). */
async function requireOwnedDevice(deviceId: string, companyId: string) {
  const device = await prisma.device.findFirst({
    where: { id: deviceId, companyId },
    select: { id: true },
  });
  if (!device) throw new HttpError(404, "Device not found");
  return device;
}

/** Reshapes a TelemetryReading row into the DTO returned by the API. */
export function toTelemetryDto(reading: TelemetryReading) {
  return {
    id: reading.id,
    deviceId: reading.deviceId,
    metricType: reading.metricType,
    value: reading.value,
    unit: reading.unit ?? undefined,
    source: reading.source,
    recordedAt: reading.recordedAt.toISOString(),
  };
}

/**
 * Writes a batch of telemetry readings for a device inside a single transaction —
 * either every reading is stored, or none are.
 */
export async function ingestTelemetry(
  companyId: string,
  deviceId: string,
  readings: TelemetryReadingInput[],
  source?: TelemetrySource
) {
  await requireOwnedDevice(deviceId, companyId);

  const now = new Date();
  const created = await prisma.$transaction(
    readings.map((reading) =>
      prisma.telemetryReading.create({
        data: {
          deviceId,
          metricType: reading.metricType as never,
          value: reading.value,
          unit: reading.unit,
          recordedAt: reading.recordedAt ?? now,
          source: reading.source ?? source ?? "real_agent",
        },
      })
    )
  );

  return { deviceId, count: created.length, timestamp: now.toISOString() };
}

/** Returns recent telemetry readings for a device, newest first, optionally filtered to one metric. */
export async function getDeviceTelemetry(
  companyId: string,
  deviceId: string,
  options: { metricType?: string; limit: number }
) {
  await requireOwnedDevice(deviceId, companyId);

  const readings = await prisma.telemetryReading.findMany({
    where: {
      deviceId,
      ...(options.metricType ? { metricType: options.metricType as never } : {}),
    },
    orderBy: { recordedAt: "desc" },
    take: options.limit,
  });

  return readings.map(toTelemetryDto);
}