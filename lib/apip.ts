// lib/apip.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type JsonValue = any;

export class ApiError extends Error {
  status: number;
  detail?: any;
  requestId?: string;
  url?: string;

  constructor(args: {
    message: string;
    status: number;
    detail?: any;
    requestId?: string;
    url?: string;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.detail = args.detail;
    this.requestId = args.requestId;
    this.url = args.url;
  }
}

function getEnvBase(): string {
  // Primary expected env var
  const a = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Backward-compat / accidental older name
  const b = process.env.NEXT_PUBLIC_API_BASE;
  const base = (a || b || "").trim();

  if (!base) {
    // Keep error message crystal clear for UI
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set (or NEXT_PUBLIC_API_BASE). " +
        "Set it in .env.local and restart `npm run dev`."
    );
  }
  return base.replace(/\/+$/, "");
}

export function apipBase(): string {
  return getEnvBase();
}

function isAbsoluteUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

function normalizePath(path: string): string {
  // Ensure leading slash for relative paths
  const p = path.trim();
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

function buildUrl(path: string): string {
  if (isAbsoluteUrl(path)) return path;
  return `${apipBase()}${normalizePath(path)}`;
}

async function readBodySafe(res: Response): Promise<{ text?: string; json?: any }> {
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const json = await res.json();
      return { json };
    }
    const text = await res.text();
    return { text };
  } catch {
    // If body can't be read (rare), just ignore
    return {};
  }
}

function pickRequestId(res: Response): string | undefined {
  return (
    res.headers.get("x-request-id") ||
    res.headers.get("X-Request-Id") ||
    undefined
  );
}

/**
 * Core fetch wrapper used by AdminPanel and other pages.
 * - path MUST be a string (guarded)
 * - automatically prefixes with NEXT_PUBLIC_API_BASE_URL unless already absolute
 * - attaches Authorization: Bearer <idToken> when provided
 */
export async function apipFetch(
  path: string,
  options?: RequestInit & { idToken?: string }
): Promise<Response> {
  if (typeof path !== "string") {
    // This is what prevents: TypeError: path.startsWith is not a function
    throw new Error(`apipFetch(path, ...): path must be a string; got ${typeof path}`);
  }

  const url = buildUrl(path);

  const headers = new Headers(options?.headers || {});
  headers.set("Accept", "application/json");

  // If caller passes JSON body and no Content-Type, set it.
  if (options?.body && !headers.has("Content-Type")) {
    // If body is string we assume caller knows; otherwise set JSON
    if (typeof options.body !== "string") {
      headers.set("Content-Type", "application/json");
    }
  }

  if (options?.idToken) {
    headers.set("Authorization", `Bearer ${options.idToken}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return res;
}

/**
 * JSON helper: throws ApiError on non-2xx with parsed body (json/text) + request id.
 */
export async function apipJson<T = any>(
  path: string,
  options?: RequestInit & { idToken?: string }
): Promise<T> {
  const res = await apipFetch(path, options);

  if (res.ok) {
    // If response has no content, return as any
    if (res.status === 204) return undefined as any;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return (await res.json()) as T;
    // Fallback: try text
    return (await res.text()) as any as T;
  }

  const requestId = pickRequestId(res);
  const { json, text } = await readBodySafe(res);

  // Many FastAPI errors look like { detail: "..." }
  const detail = json ?? text;

  throw new ApiError({
    message: `HTTP ${res.status} ${res.statusText}`,
    status: res.status,
    detail,
    requestId,
    url: res.url,
  });
}

// Convenience wrappers (nice for AdminPanel)
export function apipGet<T = any>(path: string, idToken?: string): Promise<T> {
  return apipJson<T>(path, { method: "GET", idToken });
}

export function apipPost<T = any>(
  path: string,
  body?: any,
  idToken?: string
): Promise<T> {
  return apipJson<T>(path, {
    method: "POST",
    idToken,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

export function apipPatch<T = any>(
  path: string,
  body?: any,
  idToken?: string
): Promise<T> {
  return apipJson<T>(path, {
    method: "PATCH",
    idToken,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

export function apipDelete<T = any>(path: string, idToken?: string): Promise<T> {
  return apipJson<T>(path, { method: "DELETE", idToken });
}