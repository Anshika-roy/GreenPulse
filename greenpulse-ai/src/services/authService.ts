import { login, logout, getCurrentUser } from "@/api/auth";
import type { LoginRequest } from "@/types";

const TOKEN_KEY = "gp_token";

export const authService = {
  async login(credentials: LoginRequest) {
    const res = await login(credentials);
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
