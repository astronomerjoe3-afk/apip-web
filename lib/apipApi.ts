"use client";

import { BFF_PREFIX } from "./sessionConstants";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function resolveApiBaseUrl(): string {
  return BFF_PREFIX;
}

function buildApiUrl(path: string): string {
  if (!path || typeof path !== "string") {
    throw new Error("API request path must be a non-empty string.");
  }

  if (/^https?:\/\//i.test(path)) {
    throw new Error("Absolute API URLs are not allowed from the browser.");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveApiBaseUrl()}${normalizedPath}`;
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
  const run = async (): Promise<Response> => {
    const headers = new Headers(init.headers);

    return fetch(buildApiUrl(path), {
      ...init,
      headers,
      cache: "no-store",
      credentials: "same-origin",
    });
  };

  try {
    return await run();
  } catch (error) {
    if (!isFetchFailure(error)) {
      throw error;
    }

    await wait(150);

    try {
      return await run();
    } catch (retryError) {
      if (!isFetchFailure(retryError)) {
        throw retryError;
      }

      await wait(150);
      return run();
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

export async function apipPatch<
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
    method: "PATCH",
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
