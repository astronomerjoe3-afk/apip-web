import { NextRequest, NextResponse } from "next/server";

import { resolveApiBase } from "@/lib/safeApiBase";
import { assertSameOriginMutation } from "@/lib/serverOriginGuard";
import { SESSION_COOKIE_NAME } from "@/lib/sessionConstants";

const API_BASE = resolveApiBase(
  process.env.API_BASE_URL,
  process.env.APIP_API_BASE_URL,
  process.env.NEXT_PUBLIC_APIP_API_BASE_URL,
  process.env.NEXT_PUBLIC_API_BASE_URL,
);

function sessionCookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    ...sessionCookieBase(),
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
  });
}

function setSessionCookie(response: NextResponse, value: string, expiresUtc?: string): void {
  const expiresAt = expiresUtc ? Date.parse(expiresUtc) : Number.NaN;
  const maxAgeSeconds = Number.isFinite(expiresAt)
    ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
    : 24 * 60 * 60;

  response.cookies.set({
    ...sessionCookieBase(),
    name: SESSION_COOKIE_NAME,
    value,
    maxAge: maxAgeSeconds,
  });
}

function applyRequestIdHeader(response: NextResponse, upstream: Response): void {
  const requestId = upstream.headers.get("x-request-id");
  if (requestId) {
    response.headers.set("x-request-id", requestId);
  }
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function parseErrorResponse(response: Response): Promise<string> {
  const payload = await parseJsonSafe<{ detail?: string }>(response);
  if (payload && typeof payload.detail === "string" && payload.detail.trim()) {
    return payload.detail;
  }

  try {
    const text = await response.text();
    return text.trim() || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rejected = assertSameOriginMutation(request);
  if (rejected) {
    return rejected as NextResponse;
  }

  let body: { idToken?: string; id_token?: string } | null = null;
  try {
    body = (await request.json()) as { idToken?: string; id_token?: string };
  } catch {
    body = null;
  }

  const idToken = typeof body?.idToken === "string"
    ? body.idToken
    : typeof body?.id_token === "string"
      ? body.id_token
      : "";

  if (!idToken.trim()) {
    return NextResponse.json({ detail: "idToken is required." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE}/auth/session/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(request.headers.get("x-request-id")
          ? { "X-Request-Id": request.headers.get("x-request-id") as string }
          : {}),
        ...(request.headers.get("user-agent")
          ? { "User-Agent": request.headers.get("user-agent") as string }
          : {}),
      },
      body: JSON.stringify({ id_token: idToken }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ detail: "Could not reach the API session service." }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { detail: await parseErrorResponse(upstream) },
      { status: upstream.status },
    );
  }

  const payload = await parseJsonSafe<{
    ok?: boolean;
    session_token?: string;
    expires_utc?: string;
    user?: unknown;
  }>(upstream);

  if (!payload?.session_token) {
    return NextResponse.json({ detail: "Session bootstrap did not return a token." }, { status: 502 });
  }

  const response = NextResponse.json({
    ok: true,
    expires_utc: payload.expires_utc,
    user: payload.user,
  });
  setSessionCookie(response, payload.session_token, payload.expires_utc);
  applyRequestIdHeader(response, upstream);
  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return NextResponse.json({ detail: "No active session." }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE}/auth/session`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${sessionToken}`,
        ...(request.headers.get("x-request-id")
          ? { "X-Request-Id": request.headers.get("x-request-id") as string }
          : {}),
        ...(request.headers.get("user-agent")
          ? { "User-Agent": request.headers.get("user-agent") as string }
          : {}),
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ detail: "Could not reach the API session service." }, { status: 502 });
  }

  if (!upstream.ok) {
    const response = NextResponse.json(
      { detail: await parseErrorResponse(upstream) },
      { status: upstream.status },
    );
    if (upstream.status === 401) {
      clearSessionCookie(response);
    }
    applyRequestIdHeader(response, upstream);
    return response;
  }

  const payload = await parseJsonSafe<{ ok?: boolean; user?: unknown }>(upstream);
  const response = NextResponse.json(payload || { ok: true });
  applyRequestIdHeader(response, upstream);
  return response;
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const rejected = assertSameOriginMutation(request);
  if (rejected) {
    return rejected as NextResponse;
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionToken) {
    try {
      await fetch(`${API_BASE}/auth/session/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${sessionToken}`,
          ...(request.headers.get("x-request-id")
            ? { "X-Request-Id": request.headers.get("x-request-id") as string }
            : {}),
          ...(request.headers.get("user-agent")
            ? { "User-Agent": request.headers.get("user-agent") as string }
            : {}),
        },
        cache: "no-store",
      });
    } catch {
      // Clearing the browser cookie still removes the active browser session.
    }
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
