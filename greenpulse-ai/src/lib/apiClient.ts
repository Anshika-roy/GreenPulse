/**
 * Thin HTTP client used by every file in /api.
 *
 * Behavior is controlled by VITE_USE_MOCK (defaults to "true" until a real
 * backend is deployed). When mocking, callers pass a `mockResolver` that
 * returns data shaped exactly like the real endpoint's JSON response, and
 * this client adds a realistic network delay + occasional simulated latency
 * spikes so loading states are exercised honestly during development.
 *
 * Swapping to the real backend later is a one-line change: set
 * VITE_USE_MOCK=false and provide VITE_API_BASE_URL. No component or hook
 * needs to change — they only ever talk to /api/*.ts.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  /** Used only in mock mode: produces the mock payload for this call. */
  mockResolver?: () => Promise<unknown> | unknown;
  /** Simulated network latency in mock mode, ms. Default 350–700ms. */
  mockLatency?: [number, number];
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("gp_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, signal, mockResolver, mockLatency = [350, 700] } = options;

  if (USE_MOCK) {
    if (!mockResolver) {
      throw new Error(`No mockResolver provided for ${method} ${path}`);
    }
    const [min, max] = mockLatency;
    await delay(min + Math.random() * (max - min));
    return (await mockResolver()) as T;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new ApiError(message || "Request failed", res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
