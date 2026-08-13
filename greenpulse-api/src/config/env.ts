import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/greenpulse?schema=public"),
  jwtSecret: required("JWT_SECRET", "dev-only-secret-change-me"),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? "8h") as SignOptions["expiresIn"],
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
