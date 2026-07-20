import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import { predictRequestSchema } from "../utils/schemas";
import { listRecommendations, predictDeviceFailure } from "../controllers/recommendationController";

export const recommendationRoutes = Router();

recommendationRoutes.get("/recommendations", requireAuth, asyncHandler(listRecommendations));
recommendationRoutes.post(
  "/predict",
  requireAuth,
  validate(predictRequestSchema),
  asyncHandler(predictDeviceFailure)
);
