import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const res = NextResponse.redirect(new URL("/admin/login", origin));
  res.cookies.delete(COOKIE_NAME);
  return res;
}
