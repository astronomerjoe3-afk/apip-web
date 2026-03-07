"use client";

import { auth } from "./firebase";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function resolveApiBaseUrl(): string {
  const primary = (process.env.NEXT_PUBLIC_APIP_API_BASE_URL || "").trim();
  const fallback = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
  const base = primary || fallback;

  if (!base) {
    throw new Error(
      "API base URL is not configured. Set NEXT_PUBLIC_APIP_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL in .env.local.",
    );
  }

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

async function getBearerToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
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
  const token = await getBearerToken();

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    method: "GET",
    headers,
    cache: "no-store",
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
  const token = await getBearerToken();

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return parseApiResponse<TResponse>(response);
}

export async function apipDelete<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getBearerToken();

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  return parseApiResponse<T>(response);
}