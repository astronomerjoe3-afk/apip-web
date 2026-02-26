// lib/apip.ts
export type QueryParams =
  | Record<string, string | number | boolean | null | undefined>
  | URLSearchParams;

export class ApiError extends Error {
  status: number;
  detail: unknown;
  requestId?: string;
  url?: string;

  constructor(args: {
    message: string;
    status: number;
    detail?: unknown;
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

function envBase(): string {
  // Preferred env var (your .env.local/.env.production uses this)
  const a = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Back-compat fallback (in case older code used this)
  const b = process.env.NEXT_PUBLIC_API_BASE;
  const base = (a || b || "").trim();
  return base.replace(/\/+$/, ""); // no trailing slash
}

export function apipBase(): string {
  return envBase();
}

function buildUrl(path: string, query?: QueryParams): string {
  if (typeof path !== "string") {
    // Prevent the "path.startsWith is not a function" failure mode
    throw new Error(`apipFetch: path must be a string, got ${typeof path}`);
  }

  const base = envBase();
  if (!base) {
    // This is exactly what your UI is complaining about; keep it explicit.
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  let url = `${base}${cleanPath}`;

  if (query) {
    const usp =
      query instanceof URLSearchParams ? query : new URLSearchParams();

    if (!(query instanceof URLSearchParams)) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        usp.set(k, String(v));
      }
    }

    const qs = usp.toString();
    if (qs) url += `?${qs}`;
  }

  return url;
}

async function readBodySafe(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

function parseJsonSafe(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // not JSON (or partial), return raw
  }
}

export type ApipFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string; // Firebase ID token (Bearer)
  apiKey?: string; // X-API-Key (for protected endpoints)
  query?: QueryParams;
  body?: unknown; // will be JSON.stringified unless it's FormData
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apipFetch<T = any>(
  path: string,
  opts: ApipFetchOptions = {}
): Promise<T> {
  const url = buildUrl(path, opts.query);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers || {}),
  };

  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  if (opts.apiKey) headers["X-API-Key"] = opts.apiKey;

  let body: BodyInit | undefined = undefined;

  // Only attach a body for non-GET requests (safe default)
  const method = opts.method ?? "GET";
  if (method !== "GET" && method !== "DELETE" && opts.body !== undefined) {
    if (opts.body instanceof FormData) {
      body = opts.body;
      // Let browser set Content-Type boundary automatically
    } else {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      body = JSON.stringify(opts.body);
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    signal: opts.signal,
    // credentials: "include" // only if you later add cookie auth
  });

  const requestId = res.headers.get("x-request-id") || undefined;

  // Success path
  if (res.ok) {
    // Some endpoints may return empty body
    const text = await readBodySafe(res);
    if (!text) return null as T;
    return parseJsonSafe(text) as T;
  }

  // Error path
  const text = await readBodySafe(res);
  const parsed = parseJsonSafe(text);

  const msg =
    typeof parsed === "object" && parsed && "detail" in (parsed as any)
      ? String((parsed as any).detail)
      : `HTTP ${res.status}`;

  throw new ApiError({
    message: msg,
    status: res.status,
    detail: parsed,
    requestId,
    url,
  });
}