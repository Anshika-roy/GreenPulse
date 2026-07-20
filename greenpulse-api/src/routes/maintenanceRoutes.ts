import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { listMaintenanceEvents } from "../controllers/maintenanceController";

export const maintenanceRoutes = Router();

maintenanceRoutes.get("/maintenance", requireAuth, asyncHandler(listMaintenanceEvents));
