import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const deviceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  riskLevel: z.enum(["high", "medium", "low", "all"]).optional().default("all"),
  category: z
    .enum(["laptop", "desktop", "monitor", "printer", "mobile", "server", "all"])
    .optional()
    .default("all"),
  sortBy: z.enum(["model", "health", "riskLevel", "aiConfidence"]).optional().default("health"),
  sortDir: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const deviceIdParamSchema = z.object({
  id: z.string().min(1),
});

export const createTicketSchema = z.object({
  subject: z.string().min(3),
  description: z.string().min(10),
  priority: z.enum(["urgent", "high", "normal", "low"]).default("normal"),
  deviceId: z.string().optional(),
});

export const markAlertReadParamSchema = z.object({
  id: z.string().min(1),
});

export const copilotRequestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

export const predictRequestSchema = z.object({
  deviceId: z.string().min(1),
});
