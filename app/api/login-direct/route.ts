import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  const users: Record<string, string> = {
    "kitchen2026": "SY",
    "yuki2026": "Yuki",
    "jodie2026": "Jodie",
  };

  const owner = users[code || ""];
  if (!owner) {
    return NextResponse.json({ error: "Invalid code." }, { status: 401 });
  }

  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set("recipebox_auth", code!, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  res.cookies.set("recipebox_owner", owner, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
