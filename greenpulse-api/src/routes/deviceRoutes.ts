import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import { deviceHealthParamSchema, deviceIdParamSchema, deviceListQuerySchema } from "../utils/schemas";
import { getDeviceById, listDevices } from "../controllers/deviceController";
import { getDeviceHealth } from "../controllers/deviceHealthController";

export const deviceRoutes = Router();

deviceRoutes.get(
  "/devices",
  requireAuth,
  validate(deviceListQuerySchema, "query"),
  asyncHandler(listDevices)
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
