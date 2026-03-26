import { BFF_PREFIX } from "./sessionConstants";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${BFF_PREFIX}${cleanPath}`, {
    ...init,
    headers,
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res;
}

