import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { dashboardRoutes } from "./dashboardRoutes";
import { deviceRoutes } from "./deviceRoutes";
import { maintenanceRoutes } from "./maintenanceRoutes";
import { alertRoutes } from "./alertRoutes";
import { ticketRoutes } from "./ticketRoutes";
import { recommendationRoutes } from "./recommendationRoutes";
import { copilotRoutes } from "./copilotRoutes";

export const apiRouter = Router();

apiRouter.use(authRoutes);
apiRouter.use(dashboardRoutes);
apiRouter.use(deviceRoutes);
apiRouter.use(maintenanceRoutes);
apiRouter.use(alertRoutes);
apiRouter.use(ticketRoutes);
apiRouter.use(recommendationRoutes);
apiRouter.use(copilotRoutes);
