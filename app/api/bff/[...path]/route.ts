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

const BLOCKED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "set-cookie",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

function copyUpstreamHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!BLOCKED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  return headers;
}

function buildUpstreamUrl(pathSegments: string[], search: string): string {
  const normalizedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  return `${API_BASE}/${normalizedPath}${search}`;
}

async function proxy(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const rejected = assertSameOriginMutation(request);
  if (rejected) {
    return rejected as NextResponse;
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    const response = NextResponse.json({ detail: "No active session." }, { status: 401 });
    clearSessionCookie(response);
    return response;
  }

  const headers = new Headers();
  const accept = request.headers.get("accept");
  const contentType = request.headers.get("content-type");
  const requestId = request.headers.get("x-request-id");
  const userAgent = request.headers.get("user-agent");

  if (accept) {
    headers.set("Accept", accept);
  }
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  if (requestId) {
    headers.set("X-Request-Id", requestId);
  }
  if (userAgent) {
    headers.set("User-Agent", userAgent);
  }
  headers.set("Authorization", `Bearer ${sessionToken}`);

  let body: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(request.method.toUpperCase())) {
    const buffer = await request.arrayBuffer();
    body = buffer.byteLength > 0 ? buffer : undefined;
  }

  let upstream: Response;
  try {
    upstream = await fetch(buildUpstreamUrl(pathSegments, request.nextUrl.search), {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return NextResponse.json({ detail: "Could not reach the API service." }, { status: 502 });
  }

  const payload = await upstream.arrayBuffer();
  const response = new NextResponse(payload.byteLength > 0 ? payload : null, {
    status: upstream.status,
    headers: copyUpstreamHeaders(upstream),
  });

  if (upstream.status === 401) {
    clearSessionCookie(response);
  }

  return response;
}

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(request, path || []);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(request, path || []);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(request, path || []);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(request, path || []);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(request, path || []);
}
