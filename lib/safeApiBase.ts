const DEFAULT_API_BASE_URL = "https://api.cognispark.tech";
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

function normalizeApiBase(candidate: string): string | null {
  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const protocol = url.protocol.toLowerCase();
    const hostname = url.hostname.toLowerCase();

    if (!["http:", "https:"].includes(protocol)) {
      return null;
    }

    if (protocol === "http:" && !LOOPBACK_HOSTS.has(hostname)) {
      return null;
    }

    if (url.username || url.password) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function resolveApiBase(...candidates: Array<string | undefined | null>): string {
  for (const candidate of candidates) {
    const normalized = normalizeApiBase(String(candidate || ""));
    if (normalized) {
      return normalized;
    }
  }

  return DEFAULT_API_BASE_URL;
}
