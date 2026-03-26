import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "./lib/sessionConstants";

export function proxy(request: NextRequest): NextResponse {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/student/:path*", "/instructor/:path*", "/dashboard/:path*"],
};
