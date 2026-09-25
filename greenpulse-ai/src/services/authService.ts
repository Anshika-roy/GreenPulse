import { login, logout, getCurrentUser, register } from "@/api/auth";
import type { LoginRequest, RegisterRequest } from "@/types";

const TOKEN_KEY = "gp_token";

export const authService = {
  async login(credentials: LoginRequest) {
    const res = await login(credentials);
    localStorage.setItem(TOKEN_KEY, res.token);
    return res;
  },
  async register(data: RegisterRequest) {
    const res = await register(data);
    localStorage.setItem(TOKEN_KEY, res.token);
    return res;
  },
  async logout() {
    await logout();
    localStorage.removeItem(TOKEN_KEY);
  },
  async me(signal?: AbortSignal) {
    return getCurrentUser(signal);
  },
  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
};
