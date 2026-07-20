import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimit";
import { loginSchema } from "../utils/schemas";
import { getCurrentUser, login, logout } from "../controllers/authController";

export const authRoutes = Router();

authRoutes.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(login));
authRoutes.post("/logout", requireAuth, asyncHandler(logout));
authRoutes.get("/user", requireAuth, asyncHandler(getCurrentUser));
