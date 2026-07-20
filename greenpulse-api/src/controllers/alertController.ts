import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";

/** GET /api/alerts */
export async function listAlerts(req: Request, res: Response) {
  const alerts = await prisma.alert.findMany({
    where: { device: { companyId: req.auth!.companyId } },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    alerts.map((a) => ({
      id: a.id,
      severity: a.severity,
      title: a.title,
      description: a.description,
      deviceId: a.deviceId ?? undefined,
      createdAt: a.createdAt.toISOString(),
      isRead: a.isRead,
    }))
  );
}

/** PATCH /api/alerts/:id/read */
export async function markAlertRead(req: Request, res: Response) {
  const alert = await prisma.alert.findFirst({
    where: { id: req.params.id, device: { companyId: req.auth!.companyId } },
  });
  if (!alert) throw new HttpError(404, "Alert not found");

  const updated = await prisma.alert.update({ where: { id: alert.id }, data: { isRead: true } });
  res.json({
    id: updated.id,
    severity: updated.severity,
    title: updated.title,
    description: updated.description,
    deviceId: updated.deviceId ?? undefined,
    createdAt: updated.createdAt.toISOString(),
    isRead: updated.isRead,
  });
}
