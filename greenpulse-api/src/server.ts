import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`GreenPulse API listening on http://localhost:${env.port} [${env.nodeEnv}]`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully…`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
