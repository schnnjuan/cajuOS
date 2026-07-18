import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, signToken, isAdminEmail, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload || !isAdminEmail(payload.email)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const sessionToken = await signToken({ email: payload.email }, "7d");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}
