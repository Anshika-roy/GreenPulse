import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { toDeviceDto } from "../services/deviceMapper";

const SORT_COLUMN: Record<string, string> = {
  model: "model",
  health: "healthScore",
  riskLevel: "riskLevel",
  aiConfidence: "aiConfidence",
};

/** GET /api/devices */
export async function listDevices(req: Request, res: Response) {
  const { page, pageSize, search, riskLevel, category, sortBy, sortDir } = req.query as unknown as {
    page: number;
    pageSize: number;
    search?: string;
    riskLevel: string;
    category: string;
    sortBy: string;
    sortDir: "asc" | "desc";
  };

  const where: Prisma.DeviceWhereInput = {
    companyId: req.auth!.companyId,
    ...(riskLevel !== "all" ? { riskLevel: riskLevel as never } : {}),
    ...(category !== "all" ? { category: category as never } : {}),
    ...(search
      ? {
          OR: [
            { model: { contains: search, mode: "insensitive" } },
            { assetTag: { contains: search, mode: "insensitive" } },
            { issueLabel: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.device.findMany({
      where,
      orderBy: { [SORT_COLUMN[sortBy] ?? "healthScore"]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.device.count({ where }),
  ]);

  res.json({ data: rows.map(toDeviceDto), total, page, pageSize });
}

/** GET /api/devices/:id */
export async function getDeviceById(req: Request, res: Response) {
  const device = await prisma.device.findFirst({
    where: { id: req.params.id, companyId: req.auth!.companyId },
    include: { healthHistory: { orderBy: { recordedAt: "asc" }, take: 20 } },
  });
  if (!device) throw new HttpError(404, "Device not found");
  res.json(toDeviceDto(device));
}
