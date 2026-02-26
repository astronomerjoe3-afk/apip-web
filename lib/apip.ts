// lib/apip.ts
// Centralized APIP API client for the admin dashboard.
// Backwards-compatible exports:
//   - apipFetch(method, path, idToken, body?)
//   - ApiError
//
// Prefers NEXT_PUBLIC_API_BASE_URL, falls back to NEXT_PUBLIC_API_BASE.
// Normalizes trailing slashes and throws clear, structured errors.

export type ApiErrorInfo = {
  status: number;
  message: string;
  detail?: any;
  url?: string;
};

export class ApipError extends Error {
  public info: ApiErrorInfo;

  constructor(info: ApiErrorInfo) {
    super(info.message);
    this.name = "ApipError";
    this.info = info;
  }
}

// Backwards-compatible name used by AdminPanel.tsx
export class ApiError extends ApipError {}

function resolveApiBase(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "";

  const base = raw.trim().replace(/\/+$/, "");
  if (!base) {
    throw new ApiError({
      status: 0,
      message:
        "NEXT_PUBLIC_API_BASE_URL is not set (expected e.g. https://api.cognispark.tech)",
    });
  }
  if (!/^https?:\/\//i.test(base)) {
    throw new ApiError({
      status: 0,
      message:
        `Invalid API base URL "${base}". ` +
        "It must start with http:// or https:// (e.g. https://api.cognispark.tech).",
    });
  }
  return base;
}

export const apipBase = resolveApiBase();

function joinUrl(base: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function readBodySafe(resp: Response): Promise<{ text: string; json: any }> {
  const text = await resp.text();
  let json: any = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return { text, json };
}

async function requestJson<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  idToken: string,
  body?: any
): Promise<T> {
  if (!idToken) {
    throw new ApiError({
      status: 0,
      message: "Missing idToken (Firebase ID token).",
      url: joinUrl(apipBase, path),
    });
  }

  const url = joinUrl(apipBase, path);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${idToken}`,
    Accept: "application/json",
  };

  let payload: string | undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const resp = await fetch(url, {
    method,
    headers,
    body: payload,
  });

  const { text, json } = await readBodySafe(resp);

  if (!resp.ok) {
    const msg =
      (json && (json.detail || json.message)) ||
      (text ? text : resp.statusText) ||
      `HTTP ${resp.status}`;

    throw new ApiError({
      status: resp.status,
      message: `HTTP ${resp.status}: ${msg}`,
      detail: json ?? text,
      url,
    });
  }

  return (json ?? (text ? (text as any) : ({} as any))) as T;
}

/**
 * Backwards-compatible helper used by AdminPanel.tsx
 * Example: apipFetch("GET", "/admin/metrics?top_n=10", token)
 */
export async function apipFetch<T = any>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  idToken: string,
  body?: any
): Promise<T> {
  return requestJson<T>(method, path, idToken, body);
}

/** ---------- Typed helpers (nice to use in new code) ---------- */

export type MetricsResponse = {
  ok: boolean;
  utc: string;
  keys: {
    total: number;
    active: number;
    auto_disabled?: number;
  };
  rate_limit?: {
    global_last_hour?: { total: number; window: number; daily: number };
    global_last_24h?: { total: number; window: number; daily: number };
    top_keys_last_hour?: Array<{ key_id: string; count: number }>;
    top_keys_last_24h?: Array<{ key_id: string; count: number }>;
    top_n?: number;
    scan_limit?: number;
  };
  posture?: {
    auto_disabled_total?: number;
    auto_disabled_last_at_utc?: string | null;
  };
  warnings?: string[];
  index_hints?: string[];
};

export type KeySummary = {
  key_id: string;
  label?: string;
  scopes?: string[];
  active?: boolean;
  created_at_utc?: string;
  last_used_at_utc?: string | null;
  total_requests?: number;
  rl_window_limit?: number;
  rl_window_seconds?: number;
  rl_bucket_seconds?: number;
  rl_daily_limit?: number;
};

export type KeysListResponse = {
  ok: boolean;
  count: number;
  keys: KeySummary[];
};

export type KeyGetResponse = {
  ok: boolean;
  key: KeySummary;
};

export type CreateKeyRequest = {
  label: string;
  scopes: string[];
  rl_window_limit: number;
  rl_window_seconds: number;
  rl_bucket_seconds: number;
  rl_daily_limit: number;
};

export type CreateKeyResponse = {
  ok: boolean;
  key_id: string;
  api_key: string;
  created_at_utc: string;
};

export type PatchRateLimitRequest = {
  rl_window_limit: number;
  rl_window_seconds: number;
  rl_bucket_seconds: number;
  rl_daily_limit: number;
};

export type PatchRateLimitResponse = {
  ok: boolean;
  key_id: string;
  updated: boolean;
  rate_limit: PatchRateLimitRequest;
};

export type EnableDisableResponse = {
  ok: boolean;
  key_id: string;
  enabled?: boolean;
  disabled?: boolean;
};

export type ResetCountersResponse = {
  ok: boolean;
  key_id: string;
  reset: boolean;
  details?: {
    deleted?: string[];
    errors?: string[];
  };
};

export type ProfileResponse = {
  ok: boolean;
  uid: string;
  email: string;
  email_verified: boolean;
  role: string;
  firebase_project_id: string;
  utc: string;
};

export function getApiBase(): string {
  return apipBase;
}

export async function getProfile(idToken: string): Promise<ProfileResponse> {
  return requestJson<ProfileResponse>("GET", "/profile", idToken);
}

export async function getMetrics(
  idToken: string,
  topN: number = 10
): Promise<MetricsResponse> {
  const q = `?top_n=${encodeURIComponent(String(topN))}`;
  return requestJson<MetricsResponse>("GET", `/admin/metrics${q}`, idToken);
}

export async function listKeys(
  idToken: string,
  limit: number = 20
): Promise<KeysListResponse> {
  const q = `?limit=${encodeURIComponent(String(limit))}`;
  return requestJson<KeysListResponse>("GET", `/keys${q}`, idToken);
}

export async function getKey(
  idToken: string,
  keyId: string
): Promise<KeyGetResponse> {
  return requestJson<KeyGetResponse>(
    "GET",
    `/keys/${encodeURIComponent(keyId)}`,
    idToken
  );
}

export async function createKey(
  idToken: string,
  req: CreateKeyRequest
): Promise<CreateKeyResponse> {
  return requestJson<CreateKeyResponse>("POST", "/keys", idToken, req);
}

export async function patchRateLimit(
  idToken: string,
  keyId: string,
  req: PatchRateLimitRequest
): Promise<PatchRateLimitResponse> {
  return requestJson<PatchRateLimitResponse>(
    "PATCH",
    `/keys/${encodeURIComponent(keyId)}/rate-limit`,
    idToken,
    req
  );
}

export async function enableKey(
  idToken: string,
  keyId: string
): Promise<EnableDisableResponse> {
  return requestJson<EnableDisableResponse>(
    "POST",
    `/keys/${encodeURIComponent(keyId)}/enable`,
    idToken
  );
}

export async function disableKey(
  idToken: string,
  keyId: string
): Promise<EnableDisableResponse> {
  return requestJson<EnableDisableResponse>(
    "POST",
    `/keys/${encodeURIComponent(keyId)}/disable`,
    idToken
  );
}

export async function resetKeyCounters(
  idToken: string,
  keyId: string
): Promise<ResetCountersResponse> {
  return requestJson<ResetCountersResponse>(
    "POST",
    `/keys/${encodeURIComponent(keyId)}/reset-counters`,
    idToken
  );
}