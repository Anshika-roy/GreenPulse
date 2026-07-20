import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { generateCopilotReply } from "../services/copilotEngine";

const SUGGESTIONS = [
  { id: "sug-1", icon: "risk", label: "Which devices are high risk?" },
  { id: "sug-2", icon: "budget", label: "How much budget do I need next quarter?" },
  { id: "sug-3", icon: "location", label: "Which office has the highest failure rate?" },
  { id: "sug-4", icon: "sustainability", label: "How much e-waste did we prevent this year?" },
];

/** GET /api/copilot/suggestions */
export async function getCopilotSuggestions(_req: Request, res: Response) {
  res.json(SUGGESTIONS);
}

/** POST /api/copilot */
export async function postCopilotMessage(req: Request, res: Response) {
  const { message, conversationId } = req.body as { message: string; conversationId?: string };
  const convId = conversationId ?? `conv-${Date.now()}`;

  const [totalDevices, criticalCount] = await Promise.all([
    prisma.device.count({ where: { companyId: req.auth!.companyId } }),
    prisma.device.count({ where: { companyId: req.auth!.companyId, riskLevel: "high" } }),
  ]);

  await prisma.chatMessage.create({
    data: { conversationId: convId, userId: req.auth!.userId, role: "user", content: message },
  });

  const replyContent = generateCopilotReply(message, { totalDevices, criticalCount });

  const reply = await prisma.chatMessage.create({
    data: { conversationId: convId, userId: req.auth!.userId, role: "assistant", content: replyContent },
  });

  res.json({
    conversationId: convId,
    message: {
      id: reply.id,
      role: reply.role,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
    },
  });
}
