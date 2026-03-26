import { NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function sameOrigin(request: NextRequest): boolean {
  const expectedOrigin = request.nextUrl.origin;
  const origin = request.headers.get("origin");
  if (origin) {
    return origin === expectedOrigin;
  }

  const referer = request.headers.get("referer");
  if (!referer) {
    return true;
  }

  try {
    return new URL(referer).origin === expectedOrigin;
  } catch {
    return false;
  }
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
