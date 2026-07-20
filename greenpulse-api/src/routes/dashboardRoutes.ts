import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { getDashboardSummary } from "../controllers/dashboardController";

export const dashboardRoutes = Router();

dashboardRoutes.get("/dashboard", requireAuth, asyncHandler(getDashboardSummary));
