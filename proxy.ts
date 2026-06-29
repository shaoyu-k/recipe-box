import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const code = process.env.ACCESS_CODE;
  // No access code configured — leave the box open rather than lock
  // everyone out by accident.
  if (!code) return NextResponse.next();

  const authed = request.cookies.get("recipebox_auth")?.value === code;
  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
