import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

/** GET /api/maintenance */
export async function listMaintenanceEvents(req: Request, res: Response) {
  const events = await prisma.maintenanceEvent.findMany({
    where: { devices: { some: { device: { companyId: req.auth!.companyId } } } },
    include: { devices: { select: { deviceId: true } } },
    orderBy: { date: "asc" },
  });

  res.json(
    events.map((e) => ({
      id: e.id,
      date: e.date.toISOString().slice(0, 10),
      title: e.title,
      description: e.description,
      location: e.location,
      priority: e.priority,
      deviceIds: e.devices.map((d) => d.deviceId),
    }))
  );
}
