import { NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function firstHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const first = value.split(",")[0]?.trim();
  return first || null;
}

function normalizeOrigin(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

function originFromProtocolAndHost(protocol: string | null, host: string | null): string | null {
  const normalizedProtocol = protocol?.trim().toLowerCase();
  const normalizedHost = host?.trim();

  if (!normalizedProtocol || !normalizedHost) {
    return null;
  }

  return normalizeOrigin(`${normalizedProtocol}://${normalizedHost}`);
}

function forwardedOrigin(request: NextRequest): string | null {
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = firstHeaderValue(request.headers.get("host"));

  return (
    originFromProtocolAndHost(forwardedProto, forwardedHost)
    || originFromProtocolAndHost(forwardedProto, host)
    || normalizeOrigin(request.nextUrl.origin)
  );
}

function sameOrigin(request: NextRequest): boolean {
  const expectedOrigin = forwardedOrigin(request);
  if (!expectedOrigin) {
    return false;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    return normalizeOrigin(origin) === expectedOrigin;
  }

  const referer = request.headers.get("referer");
  if (!referer) {
    return true;
  }

  return normalizeOrigin(referer) === expectedOrigin;
}

export function assertSameOriginMutation(request: NextRequest): Response | null {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) {
    return null;
  }

  if (sameOrigin(request)) {
    return null;
  }

  return Response.json({ detail: "Cross-site request rejected." }, { status: 403 });
}
