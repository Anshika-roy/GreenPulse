import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { estimateSavings, scoreDevice } from "../services/recommendationEngine";

/** GET /api/recommendations */
export async function listRecommendations(req: Request, res: Response) {
  const devices = await prisma.device.findMany({
    where: { companyId: req.auth!.companyId, riskLevel: { not: "low" } },
    orderBy: { healthScore: "asc" },
    take: 10,
  });

  res.json(
    devices.map((d) => ({
      id: `rec-${d.id}`,
      deviceId: d.id,
      action: d.recommendedAction,
      rationale: `${d.issueLabel} detected with ${d.aiConfidence}% confidence.`,
      confidence: d.aiConfidence,
      potentialSavingsInr: estimateSavings(d),
    }))
  );
}

/** POST /api/predict */
export async function predictDeviceFailure(req: Request, res: Response) {
  const { deviceId } = req.body as { deviceId: string };

  const device = await prisma.device.findFirst({
    where: { id: deviceId, companyId: req.auth!.companyId },
  });
  if (!device) throw new HttpError(404, "Device not found");

  const prediction = scoreDevice(device);

  await prisma.prediction.create({
    data: {
      deviceId: device.id,
      riskLevel: prediction.riskLevel,
      confidence: prediction.confidence,
      predictedFailureWindowDays: prediction.predictedFailureWindowDays,
      contributingFactors: prediction.contributingFactors,
    },
  });

  res.json({ deviceId: device.id, ...prediction });
}
