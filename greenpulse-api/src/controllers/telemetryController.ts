import type { Request, Response } from "express";
import { getDeviceTelemetry, ingestTelemetry } from "../services/telemetryService";

/** POST /api/telemetry */
export async function postTelemetry(req: Request, res: Response) {
  let targetDeviceId = req.body.deviceId as string;

  // If authenticated via Agent Token, enforce device ID matching
  if (req.authenticatedDevice) {
    if (targetDeviceId && targetDeviceId !== req.authenticatedDevice.id) {
      return res.status(403).json({
        error: "Forbidden: Device Agent Token does not match requested device ID.",
      });
    }
    targetDeviceId = req.authenticatedDevice.id;
  }

  const { readings } = req.body as {
    source?: "real_agent" | "demo_simulated";
    readings: { metricType: string; value: number; unit?: string; recordedAt?: Date; source?: "real_agent" | "demo_simulated" }[];
  };

  const result = await ingestTelemetry(req.auth!.companyId, targetDeviceId, readings, req.body.source);

  res.status(201).json({
    success: true,
    deviceId: result.deviceId,
    readingsStored: result.count,
    timestamp: result.timestamp,
    healthScore: result.healthScore,
    riskLevel: result.riskLevel,
  });
}

/** GET /api/telemetry/:deviceId */
export async function getTelemetry(req: Request, res: Response) {
  const { deviceId } = req.params as { deviceId: string };
  const { metricType, limit } = req.query as unknown as { metricType?: string; limit: number };

  const data = await getDeviceTelemetry(req.auth!.companyId, deviceId, { metricType, limit });

  res.json({ deviceId, count: data.length, data });
}
