import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const res = NextResponse.redirect(new URL("/admin/login", "https://cajuos.dev"));
  res.cookies.delete(COOKIE_NAME);
  return res;
}
