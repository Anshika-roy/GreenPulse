// Prisma 7 configuration file.
// The database connection URL used to live in prisma/schema.prisma's
// `datasource` block; Prisma 7 requires it here instead (see P1012).
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
