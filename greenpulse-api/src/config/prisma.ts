import { PrismaClient } from "@prisma/client";

// Single shared Prisma client instance across the app (avoids exhausting DB
// connections in dev with hot-reload creating multiple clients).
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
