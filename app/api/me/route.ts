import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const owner = request.cookies.get("recipebox_owner")?.value ?? null;
  return NextResponse.json({ owner });
}
