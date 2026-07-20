import { apiRequest } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse, User } from "@/types";
import userMock from "@/mock/users.json";

/** POST /api/login */
export function login(req: LoginRequest) {
  return apiRequest<LoginResponse>("/login", {
    method: "POST",
    body: req,
    mockResolver: (): LoginResponse => {
      if (!req.email || req.password.length < 4) {
        throw new Error("Invalid email or password");
      }
      return { token: `mock-jwt-${Date.now()}`, user: userMock as User };
    },
  });
}

/** POST /api/logout */
export function logout() {
  return apiRequest<void>("/logout", {
    method: "POST",
    mockResolver: () => undefined,
  });
}

/** GET /api/user */
export function getCurrentUser(signal?: AbortSignal) {
  return apiRequest<User>("/user", {
    method: "GET",
    signal,
    mockResolver: () => userMock as User,
  });
}
