import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/render";
import { EmailVerification } from "@/emails/EmailVerification";
import { sendEmail } from "@/lib/resend-send";
import { logEmail } from "@/lib/email-log";
import { randomUUID } from "crypto";
import React from "react";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await prisma.users.findUnique({ where: { id: user.id } });
  if (caller?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const target = await prisma.users.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const token = randomUUID();
  await prisma.users.update({ where: { id }, data: { verification_token: token } });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const verificationUrl = `${siteUrl}/auth/confirmar-email?token=${token}`;
  const subject = `Verificá tu email para activar tu cuenta`;

  try {
    const config = await prisma.store_config.findFirst();
    const storeName = config?.store_name ?? "Tienda";
    const fromEmail = (config as typeof config & { sender_email?: string | null })?.sender_email;
    const from = fromEmail
      ? `${storeName} <${fromEmail}>`
      : `${storeName} <onboarding@resend.dev>`;

    const html = String(render(
      React.createElement(EmailVerification, {
        storeName,
        primaryColor: config?.primary_color ?? "#C8511B",
        clientName: `${target.nombre ?? ""} ${target.apellido ?? ""}`.trim() || target.email,
        verificationUrl,
        logoUrl: config?.logo_url ?? null,
      })
    ));

    const { id: resendId } = await sendEmail({ from, to: [target.email], subject, html }, storeName);
    await logEmail({ to: target.email, subject, tipo: "verificacion", userId: target.id, resendId });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logEmail({ to: target.email, subject, tipo: "verificacion", userId: target.id, error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
