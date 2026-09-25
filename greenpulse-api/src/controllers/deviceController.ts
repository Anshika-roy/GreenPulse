import type { Request, Response } from "express";
import crypto from "crypto";
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

/** POST /api/devices/enroll */
export async function enrollDevice(req: Request, res: Response) {
  const { name, deviceType, serialNumber, location, ownerName } = req.body as {
    name: string;
    deviceType?: string;
    serialNumber?: string;
    location?: string;
    ownerName?: string;
  };

  if (!name) {
    throw new HttpError(400, "Device name is required");
  }

  const rawToken = `gp_agent_${crypto.randomBytes(20).toString("hex")}`;
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const assetTag = serialNumber ? serialNumber.toUpperCase() : `GP-DEV-${Math.floor(1000 + Math.random() * 9000)}`;
  const category = (deviceType || "laptop").toLowerCase();

  const device = await prisma.device.create({
    data: {
      companyId: req.auth!.companyId,
      assetTag,
      model: name,
      category: category as never,
      status: "active",
      healthScore: 95,
      riskLevel: "low",
      aiConfidence: 90,
      issueCode: "HEALTHY",
      issueLabel: "Optimal Operating Condition",
      issueDetectedAt: new Date(),
      recommendedAction: "Routine Monitoring",
      recommendedType: "monitor",
      recommendedEta: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      enrollmentStatus: "ENROLLED",
      agentTokenHash: tokenHash,
      agentTokenCreatedAt: new Date(),
      location: location || undefined,
      ownerName: ownerName || undefined,
    },
  });

  res.status(201).json({
    device: toDeviceDto(device),
    agentToken: rawToken,
  });
}

/** POST /api/devices/:id/regenerate-token */
export async function regenerateAgentToken(req: Request, res: Response) {
  const device = await prisma.device.findFirst({
    where: { id: req.params.id, companyId: req.auth!.companyId },
  });

  if (!device) throw new HttpError(404, "Device not found");

  const rawToken = `gp_agent_${crypto.randomBytes(20).toString("hex")}`;
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.device.update({
    where: { id: device.id },
    data: {
      agentTokenHash: tokenHash,
      agentTokenCreatedAt: new Date(),
    },
  });

  res.json({
    id: device.id,
    agentToken: rawToken,
  });
}
