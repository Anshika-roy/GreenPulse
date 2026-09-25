import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import { deviceHealthParamSchema, deviceIdParamSchema, deviceListQuerySchema } from "../utils/schemas";
import { enrollDevice, getDeviceById, listDevices, regenerateAgentToken } from "../controllers/deviceController";
import { getDeviceHealth } from "../controllers/deviceHealthController";

export const deviceRoutes = Router();

deviceRoutes.get(
  "/devices",
  requireAuth,
  validate(deviceListQuerySchema, "query"),
  asyncHandler(listDevices)
);
deviceRoutes.post(
  "/devices/enroll",
  requireAuth,
  asyncHandler(enrollDevice)
);
deviceRoutes.post(
  "/devices/:id/regenerate-token",
  requireAuth,
  validate(deviceIdParamSchema, "params"),
  asyncHandler(regenerateAgentToken)
);
deviceRoutes.get(
  "/devices/:id",
  requireAuth,
  validate(deviceIdParamSchema, "params"),
  asyncHandler(getDeviceById)
);
deviceRoutes.get(
  "/devices/:deviceId/health",
  requireAuth,
  validate(deviceHealthParamSchema, "params"),
  asyncHandler(getDeviceHealth)
);
