import type { Request, Response } from "express";
import { computeDashboardSummary } from "../services/dashboardService";
import { prisma } from "../config/prisma";

/** GET /api/dashboard */
export async function getDashboardSummary(req: Request, res: Response) {
  const summary = await computeDashboardSummary(req.auth!.companyId);
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
  res.json({ ...summary, userName: user?.name.split(" ")[0] ?? "there" });
}
