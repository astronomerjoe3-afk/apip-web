import type { NextConfig } from "next";

const DEFAULT_API_BASE_URL = "https://api.cognispark.tech";
const LOCAL_API_ORIGINS = new Set([
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "https://127.0.0.1:3000",
  "https://localhost:3000",
]);

function normalizeOrigin(candidate: string): string | null {
  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const protocol = url.protocol.toLowerCase();
    const origin = url.origin;

    if (!["http:", "https:"].includes(protocol)) {
      return null;
    }

    if (protocol === "http:" && !LOCAL_API_ORIGINS.has(origin)) {
      return null;
    }

    return origin;
  } catch {
    return null;
  }
}

function resolvedApiOrigin(): string {
  const primary = normalizeOrigin(process.env.NEXT_PUBLIC_APIP_API_BASE_URL || "");
  const fallback = normalizeOrigin(process.env.NEXT_PUBLIC_API_BASE_URL || "");
  return primary || fallback || DEFAULT_API_BASE_URL;
}

function contentSecurityPolicy(isProduction: boolean): string {
  const connectSrc = [
    "'self'",
    resolvedApiOrigin(),
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://firebaseinstallations.googleapis.com",
  ];

  const scriptSrc = ["'self'", "'unsafe-inline'"];

  if (!isProduction) {
    connectSrc.push(
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "ws://127.0.0.1:3000",
      "ws://localhost:3000",
    );
    scriptSrc.push("'unsafe-eval'");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ];

  if (isProduction) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

const isProduction = process.env.NODE_ENV === "production";
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy(isProduction) },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
