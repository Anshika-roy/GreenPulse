import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import { copilotRequestSchema } from "../utils/schemas";
import { getCopilotSuggestions, postCopilotMessage } from "../controllers/copilotController";

export const copilotRoutes = Router();

copilotRoutes.get("/copilot/suggestions", requireAuth, asyncHandler(getCopilotSuggestions));
copilotRoutes.post("/copilot", requireAuth, validate(copilotRequestSchema), asyncHandler(postCopilotMessage));
