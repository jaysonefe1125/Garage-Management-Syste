import { NextRequest, NextResponse } from "next/server";
import { getIronSession, nextProxyCookies } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    nextProxyCookies(request, response),
    sessionOptions
  );

  if (!session.userId) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
};
