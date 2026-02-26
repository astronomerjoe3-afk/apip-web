// lib/apip.ts
export type ApiError = {
  status: number;
  message: string;
  detail?: any;
};

async function safeReadJson(resp: Response) {
  const text = await resp.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

export async function apipFetch<T>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    token?: string;
    body?: any;
    query?: Record<string, string | number | boolean | undefined | null>;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) {
    throw { status: 0, message: "NEXT_PUBLIC_API_BASE is not set" } satisfies ApiError;
  }

  const url = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : base + "/");

  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? 20000;
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url.toString(), {
      method: opts.method ?? "GET",
      headers: {
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
      // do not cache admin data
      cache: "no-store",
    });

    const data = await safeReadJson(resp);

    if (!resp.ok) {
      const msg =
        (typeof data === "object" && data && "detail" in data && (data as any).detail) ||
        resp.statusText ||
        "Request failed";
      throw { status: resp.status, message: String(msg), detail: data } satisfies ApiError;
    }

    return data as T;
  } finally {
    clearTimeout(t);
  }
}