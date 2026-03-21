"use client";

import { auth } from "./firebase";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const DEFAULT_API_BASE_URL = "https://api.cognispark.tech";

type FirebaseUserLike = {
  accessToken?: string;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  stsTokenManager?: {
    accessToken?: string;
  };
};

function resolveApiBaseUrl(): string {
  const primary = (process.env.NEXT_PUBLIC_APIP_API_BASE_URL || "").trim();
  const fallback = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
  const base = primary || fallback || DEFAULT_API_BASE_URL;
  return base.replace(/\/+$/, "");
}

function buildApiUrl(path: string): string {
  if (!path || typeof path !== "string") {
    throw new Error("API request path must be a non-empty string.");
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveApiBaseUrl()}${normalizedPath}`;
}

function cachedAccessToken(user: FirebaseUserLike | null): string | null {
  const direct = typeof user?.accessToken === "string" ? user.accessToken.trim() : "";
  if (direct) return direct;

  const nested = typeof user?.stsTokenManager?.accessToken === "string"
    ? user.stsTokenManager.accessToken.trim()
    : "";
  return nested || null;
}

async function getBearerToken(forceRefresh: boolean = false): Promise<string | null> {
  const user = (auth?.currentUser ?? null) as FirebaseUserLike | null;
  if (!user) return null;

  if (!forceRefresh) {
    const cached = cachedAccessToken(user);
    if (cached) {
      return cached;
    }
  }

  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    const cached = cachedAccessToken(user);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

function isFetchFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message === "Failed to fetch" || error.name === "TypeError";
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function performRequest(path: string, init: RequestInit): Promise<Response> {
  const run = async (forceRefreshToken: boolean): Promise<Response> => {
    const headers = new Headers(init.headers);
    const token = await getBearerToken(forceRefreshToken);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(buildApiUrl(path), {
      ...init,
      headers,
      cache: "no-store",
    });
  };

  try {
    const response = await run(false);
    if (response.status === 401 && auth?.currentUser) {
      await wait(150);
      return run(true);
    }
    return response;
  } catch (error) {
    if (!isFetchFailure(error) || !auth?.currentUser) {
      throw error;
    }

    await wait(150);

    try {
      return await run(false);
    } catch (retryError) {
      if (!isFetchFailure(retryError) || !auth?.currentUser) {
        throw retryError;
      }

      await wait(150);
      return run(true);
    }
  }
}

function summarizeHtmlError(html: string, status: number): string {
  if (status === 404) {
    return "Requested route was not found. Check the API base URL and endpoint path.";
  }
  if (status === 401) {
    return "Unauthorized request.";
  }
  if (status === 403) {
    return "Forbidden request.";
  }
  return `Request failed with status ${status}. Server returned HTML instead of JSON.`;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.toLowerCase().includes("application/json");

  const payload: unknown = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const detail =
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof (payload as { detail?: unknown }).detail === "string"
        ? (payload as { detail: string }).detail
        : typeof payload === "string"
          ? contentType.toLowerCase().includes("text/html")
            ? summarizeHtmlError(payload, response.status)
            : payload
          : `Request failed with status ${response.status}`;

    throw new Error(detail);
  }

  return payload as T;
}

export async function apipGet<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await performRequest(path, {
    ...init,
    method: "GET",
  });

  return parseApiResponse<T>(response);
}

export async function apipPost<
  TResponse,
  TBody extends JsonObject = JsonObject,
>(
  path: string,
  body: TBody,
  init?: RequestInit,
): Promise<TResponse> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const response = await performRequest(path, {
    ...init,
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  return parseApiResponse<TResponse>(response);
}

export async function apipDelete<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await performRequest(path, {
    ...init,
    method: "DELETE",
  });

  return parseApiResponse<T>(response);
}
