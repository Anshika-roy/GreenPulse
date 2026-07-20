import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import { markAlertReadParamSchema } from "../utils/schemas";
import { listAlerts, markAlertRead } from "../controllers/alertController";

export const alertRoutes = Router();

alertRoutes.get("/alerts", requireAuth, asyncHandler(listAlerts));
alertRoutes.patch(
  "/alerts/:id/read",
  requireAuth,
  validate(markAlertReadParamSchema, "params"),
  asyncHandler(markAlertRead)
);
