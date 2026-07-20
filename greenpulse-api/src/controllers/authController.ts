import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { signToken } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { toUserDto } from "../services/userService";

/** POST /api/login */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email }, include: { company: true } });
  if (!user) throw new HttpError(401, "Invalid email or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new HttpError(401, "Invalid email or password");

  const token = signToken({ userId: user.id, companyId: user.companyId, email: user.email });
  res.json({ token, user: toUserDto(user) });
}

/** POST /api/logout — JWTs are stateless, so this is a client-side no-op the API acknowledges. */
export async function logout(_req: Request, res: Response) {
  res.status(204).send();
}

/** GET /api/user */
export async function getCurrentUser(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    include: { company: true },
  });
  if (!user) throw new HttpError(404, "User not found");
  res.json(toUserDto(user));
}
