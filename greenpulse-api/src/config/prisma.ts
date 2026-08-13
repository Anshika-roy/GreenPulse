import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// Single shared Prisma client instance across the app (avoids exhausting DB
// connections in dev with hot-reload creating multiple clients).
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  datasources: {
    db: {
      url: env.databaseUrl,
    },
  },
});
