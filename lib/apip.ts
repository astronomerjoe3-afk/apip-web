// lib/apip.ts

import { BFF_PREFIX } from "./sessionConstants";

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue> | URLSearchParams;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonBody = JsonValue | FormData;

type ErrorWithDetail = {
  detail?: unknown;
};

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
  return BFF_PREFIX;
}

export function apipBase(): string {
  return envBase();
}

function buildUrl(path: string, query?: QueryParams): string {
  if (typeof path !== "string") {
    throw new Error(`apipFetch: path must be a string, got ${typeof path}`);
  }

  const base = envBase();
  if (!base) {
    throw new Error("The same-origin API proxy is not available.");
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  let url = `${base}${cleanPath}`;

  if (query) {
    const usp =
      query instanceof URLSearchParams ? query : new URLSearchParams();

    if (!(query instanceof URLSearchParams)) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        usp.set(key, String(value));
      }
    }

    const qs = usp.toString();
    if (qs) {
      url += `?${qs}`;
    }
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
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractErrorMessage(parsed: unknown, status: number): string {
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "detail" in parsed &&
    typeof (parsed as ErrorWithDetail).detail === "string"
  ) {
    return (parsed as ErrorWithDetail).detail as string;
  }

  if (typeof parsed === "string" && parsed.trim()) {
    return parsed;
  }

  return `HTTP ${status}`;
}

export type ApipFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  apiKey?: string;
  query?: QueryParams;
  body?: JsonBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apipFetch<T = unknown>(
  path: string,
  opts: ApipFetchOptions = {},
): Promise<T> {
  const url = buildUrl(path, opts.query);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers || {}),
  };

  if (opts.apiKey) {
    headers["X-API-Key"] = opts.apiKey;
  }

  let body: BodyInit | undefined;

  const method = opts.method ?? "GET";
  if (method !== "GET" && method !== "DELETE" && opts.body !== undefined) {
    if (opts.body instanceof FormData) {
      body = opts.body;
    } else {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      body = JSON.stringify(opts.body);
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
    credentials: "same-origin",
    signal: opts.signal,
  });

  const requestId = res.headers.get("x-request-id") || undefined;

  if (res.ok) {
    const text = await readBodySafe(res);
    if (!text) {
      return null as T;
    }
    return parseJsonSafe(text) as T;
  }

  const text = await readBodySafe(res);
  const parsed = parseJsonSafe(text);

  throw new ApiError({
    message: extractErrorMessage(parsed, res.status),
    status: res.status,
    detail: parsed,
    requestId,
    url,
  });
}
