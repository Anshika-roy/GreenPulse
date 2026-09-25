import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireAgentOrUserAuth } from "../middleware/agentAuth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import {
  ingestTelemetrySchema,
  telemetryDeviceParamSchema,
  telemetryListQuerySchema,
} from "../utils/schemas";
import { getTelemetry, postTelemetry } from "../controllers/telemetryController";

export const telemetryRoutes = Router();

telemetryRoutes.post(
  "/telemetry",
  requireAgentOrUserAuth,
  validate(ingestTelemetrySchema),
  asyncHandler(postTelemetry)
);

telemetryRoutes.get(
  "/telemetry/:deviceId",
  requireAuth,
  validate(telemetryDeviceParamSchema, "params"),
  validate(telemetryListQuerySchema, "query"),
  asyncHandler(getTelemetry)
);