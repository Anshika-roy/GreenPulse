import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import { deviceIdParamSchema, deviceListQuerySchema } from "../utils/schemas";
import { getDeviceById, listDevices } from "../controllers/deviceController";

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
