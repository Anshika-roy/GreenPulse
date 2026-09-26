import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import type { AuthPayload } from "./auth";
import type { Device } from "@prisma/client";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      authenticatedDevice?: Device;
    }
  }
}

/**
 * Dual Authentication Middleware:
 * Accepts EITHER a Human Dashboard JWT (`Bearer <jwt>`) OR a Device Agent Token (`Bearer gp_agent_<raw_token>`).
 *
 * When an Agent Token is supplied:
 * 1. Hashes the incoming token with SHA-256.
 * 2. Queries PostgreSQL for the Device matching `agentTokenHash`.
 * 3. Rejects invalid/revoked tokens with HTTP 401.
 * 4. Attaches `req.authenticatedDevice` and populates `req.auth.companyId`.
 */
export async function requireAgentOrUserAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const xDeviceToken = req.headers["x-device-token"] as string | undefined;

  let rawToken = "";
  if (xDeviceToken) {
    rawToken = xDeviceToken.trim();
  } else if (authHeader?.startsWith("Bearer ")) {
    rawToken = authHeader.slice("Bearer ".length).trim();
  }

  if (!rawToken) {
    return res.status(401).json({ error: "Missing or malformed Authorization or X-Device-Token header. Agent token or User JWT required." });
  }

  // Case A: Device Agent Token (starts with gp_agent_)
  if (rawToken.startsWith("gp_agent_")) {
    try {
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const device = await prisma.device.findFirst({
        where: { agentTokenHash: tokenHash },
      });

      if (!device) {
        return res.status(401).json({ error: "Invalid or revoked device agent token." });
      }

      req.authenticatedDevice = device;
      req.auth = {
        userId: "agent",
        companyId: device.companyId,
        email: "agent@greenpulse.local",
      };
      return next();
    } catch (err) {
      return res.status(500).json({ error: "Error authenticating device agent token." });
    }
  }

  // Case B: Human Dashboard JWT
  try {
    const payload = jwt.verify(rawToken, env.jwtSecret) as AuthPayload;
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
