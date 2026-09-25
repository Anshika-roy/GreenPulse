import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { apiRateLimiter } from "./middleware/rateLimit";

export function createApp() {
  const app = express();

  const allowedOrigins = Array.from(
    new Set([
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      env.corsOrigin.replace(/\/$/, ""),
      env.frontendUrl.replace(/\/$/, ""),
    ].filter(Boolean))
  );

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
  app.use("/api", apiRateLimiter);

  const healthHandler = (_req: express.Request, res: express.Response) => res.json({ status: "ok" });
  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
