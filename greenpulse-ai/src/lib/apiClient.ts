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

const hasApiUrl = Boolean(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL);
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || (import.meta.env.VITE_USE_MOCK !== "false" && !hasApiUrl);
const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";
const API_BASE_URL = rawApiUrl.replace(/\/$/, "");

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

  try {
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
      let errorMessage = res.statusText || "Request failed";
      try {
        const data = await res.json();
        if (data.details?.fieldErrors) {
          const firstField = Object.keys(data.details.fieldErrors)[0];
          if (firstField && data.details.fieldErrors[firstField]?.[0]) {
            errorMessage = `${firstField}: ${data.details.fieldErrors[firstField][0]}`;
          } else {
            errorMessage = data.error || data.message || "Validation failed";
          }
        } else {
          errorMessage = data.error || data.message || (typeof data === "string" ? data : JSON.stringify(data));
        }
      } catch {
        const text = await res.text().catch(() => "");
        if (text) errorMessage = text;
      }
      throw new ApiError(errorMessage, res.status);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (mockResolver && import.meta.env.VITE_USE_MOCK !== "false") {
      console.warn(`Backend API unreachable at ${API_BASE_URL}${path}. Falling back to mock resolver.`);
      return (await mockResolver()) as T;
    }
    throw new ApiError(`Cannot connect to backend server. Ensure backend is running or set VITE_USE_MOCK=true.`, 503);
  }
}
