import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code } = await request.json();
  const expected = process.env.ACCESS_CODE;

  if (!expected || code !== expected) {
    return NextResponse.json({ error: "Invalid code." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("recipebox_auth", expected, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
