import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { signToken } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { toUserDto } from "../services/userService";

/** POST /api/register or POST /api/auth/register */
export async function register(req: Request, res: Response) {
  const { companyName, name, email, password } = req.body as {
    companyName: string;
    name: string;
    email: string;
    password: string;
  };

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedCompanyName = companyName?.trim();
  const trimmedName = name?.trim();

  if (!trimmedCompanyName) throw new HttpError(400, "Company name is required");
  if (!trimmedName) throw new HttpError(400, "Name is required");

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new HttpError(400, "Email address is already in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: trimmedCompanyName },
    });

    const user = await tx.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        role: "IT Administrator",
        companyId: company.id,
      },
      include: { company: true },
    });

    return { company, user };
  });

  const token = signToken({
    userId: result.user.id,
    companyId: result.user.companyId,
    email: result.user.email,
  });

  res.status(201).json({ token, user: toUserDto(result.user) });
}

/** POST /api/login */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const normalizedEmail = (email || "").trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail }, include: { company: true } });
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
