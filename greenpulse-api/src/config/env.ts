import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const jwtSecretFallback = nodeEnv === "production" ? undefined : "dev-only-secret-change-me";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv,
  databaseUrl: required("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/greenpulse?schema=public"),
  jwtSecret: required("JWT_SECRET", jwtSecretFallback),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? "8h") as SignOptions["expiresIn"],
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  frontendUrl: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:5173",
  greenpulseApiUrl: process.env.GREENPULSE_API_URL || `http://localhost:${process.env.PORT ?? 4000}/api`,
};
