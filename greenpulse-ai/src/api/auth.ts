import { apiRequest } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse, RegisterRequest, User } from "@/types";
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

/** POST /api/auth/register */
export function register(req: RegisterRequest) {
  return apiRequest<LoginResponse>("/auth/register", {
    method: "POST",
    body: req,
    mockResolver: (): LoginResponse => {
      if (!req.email || !req.password || !req.companyName || !req.name) {
        throw new Error("All registration fields are required");
      }
      return {
        token: `mock-jwt-${Date.now()}`,
        user: {
          id: `usr-${Date.now()}`,
          name: req.name,
          role: "IT Administrator",
          email: req.email,
          company: {
            id: `cmp-${Date.now()}`,
            name: req.companyName,
          },
        },
      };
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
