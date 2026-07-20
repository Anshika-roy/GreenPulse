import type { Company, User } from "@prisma/client";

type UserWithCompany = User & { company: Company };

/** Strips passwordHash and reshapes DB row into the DTO the frontend's User type expects. */
export function toUserDto(user: UserWithCompany) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    company: { id: user.company.id, name: user.company.name },
  };
}
