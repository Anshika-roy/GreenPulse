import type { Request, Response } from "express";
import { getDeviceTelemetry } from "../services/telemetryService";
import { analyzeDeviceHealth } from "../services/deviceHealthService";

/** GET /api/devices/:deviceId/health */
export async function getDeviceHealth(req: Request, res: Response) {
  const { deviceId } = req.params as { deviceId: string };

  const readings = await getDeviceTelemetry(req.auth!.companyId, deviceId, { limit: 100 });
  const health = analyzeDeviceHealth(deviceId, readings);

  res.json(health);
}