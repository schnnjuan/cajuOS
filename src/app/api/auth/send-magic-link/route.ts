import { NextResponse } from "next/server";
import { Resend } from "resend";
import { signToken, isAdminEmail } from "@/lib/auth";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string" || !isAdminEmail(email)) {
    return NextResponse.json({ ok: true });
  }

  const token = await signToken({ email }, "15m");

  const link = `${request.headers.get("origin") ?? "https://cajuos.dev"}/api/auth/verify?token=${token}`;

  const resend = new Resend(process.env.RESEND_API_KEY!);

  await resend.emails.send({
    from: "CajuOS <noreply@cajuos.dev>",
    to: email,
    subject: "Login — CajuOS Admin",
    html: `<p><a href="${link}">Clique aqui</a> para entrar no admin. Este link expira em 15 minutos.</p>`,
  });

  return NextResponse.json({ ok: true });
}
