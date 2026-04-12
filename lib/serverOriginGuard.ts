import { NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const DEFAULT_ALLOWED_APP_ORIGINS = [
  "https://app.cognispark.tech",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "https://127.0.0.1:3000",
  "https://localhost:3000",
];

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

function allowedAppOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>();
  const candidates = [
    ...DEFAULT_ALLOWED_APP_ORIGINS,
    process.env.APP_BASE_URL || "",
    process.env.NEXT_PUBLIC_APP_BASE_URL || "",
    process.env.NEXT_PUBLIC_SITE_URL || "",
    request.nextUrl.origin,
    forwardedOrigin(request) || "",
  ];

  for (const candidate of candidates) {
    const origin = normalizeOrigin(candidate);
    if (origin) {
      origins.add(origin);
    }
  }

  return origins;
}

function trustedFetchSite(request: NextRequest): boolean | null {
  const fetchSite = firstHeaderValue(request.headers.get("sec-fetch-site"))?.toLowerCase();
  if (!fetchSite) {
    return null;
  }

  if (fetchSite === "cross-site") {
    return false;
  }

  if (fetchSite === "same-origin" || fetchSite === "same-site") {
    return true;
  }

  return null;
}

function sameOrigin(request: NextRequest): boolean {
  const allowedOrigins = allowedAppOrigins(request);
  if (!allowedOrigins.size) {
    return false;
  }

  const origin = normalizeOrigin(request.headers.get("origin"));
  if (origin) {
    return allowedOrigins.has(origin);
  }

  const referer = request.headers.get("referer");
  if (!referer) {
    return true;
  }

  const refererOrigin = normalizeOrigin(referer);
  return !!refererOrigin && allowedOrigins.has(refererOrigin);
}

export function assertSameOriginMutation(request: NextRequest): Response | null {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) {
    return null;
  }

  const fetchSite = trustedFetchSite(request);
  if (fetchSite === false) {
    return Response.json({ detail: "Cross-site request rejected." }, { status: 403 });
  }

  if (sameOrigin(request)) {
    return null;
  }

  if (fetchSite === true) {
    return null;
  }

  return Response.json({ detail: "Cross-site request rejected." }, { status: 403 });
}
