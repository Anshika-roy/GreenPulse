import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimit";
import { loginSchema, registerSchema } from "../utils/schemas";
import { getCurrentUser, login, logout, register } from "../controllers/authController";

export const authRoutes = Router();

authRoutes.post("/register", authRateLimiter, validate(registerSchema), asyncHandler(register));
authRoutes.post("/auth/register", authRateLimiter, validate(registerSchema), asyncHandler(register));
authRoutes.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(login));
authRoutes.post("/logout", requireAuth, asyncHandler(logout));
authRoutes.get("/user", requireAuth, asyncHandler(getCurrentUser));
