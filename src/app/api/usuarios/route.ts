import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/render";
import { EmailVerification } from "@/emails/EmailVerification";
import { sendEmail } from "@/lib/resend-send";
import { logEmail } from "@/lib/email-log";
import { randomUUID } from "crypto";
import React from "react";

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (userRecord?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const users = await prisma.users.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true, email: true, nombre: true, apellido: true, telefono: true,
        rol: true, activo: true, email_verificado: true, created_at: true,
      },
    });
    return NextResponse.json(users);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("GET /api/usuarios error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const existing = await prisma.users.findUnique({ where: { email: body.email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
  }

  const token = randomUUID();

  const user = await prisma.users.create({
    data: {
      id: body.id,
      email: body.email,
      nombre: body.nombre,
      apellido: body.apellido,
      telefono: body.telefono,
      rol: "cliente",
      email_verificado: false,
      verification_token: token,
    },
  });

  // Sincronizar estado en Supabase Auth metadata para que el LoginForm lo lea del JWT
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = await createAdminClient();
    await admin.auth.admin.updateUserById(body.id, {
      user_metadata: { activo: true, email_verificado: false },
    });
  } catch { /* no bloquear el registro si esto falla */ }

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
        clientName: `${body.nombre ?? ""} ${body.apellido ?? ""}`.trim() || body.email,
        verificationUrl,
        logoUrl: config?.logo_url ?? null,
      })
    ));

    const { id: resendId } = await sendEmail({ from, to: [body.email], subject, html }, storeName);
    await logEmail({ to: body.email, subject, tipo: "verificacion", userId: user.id, resendId });
  } catch (emailError) {
    const msg = emailError instanceof Error ? emailError.message : String(emailError);
    console.error("Verification email error:", msg);
    await logEmail({ to: body.email, subject, tipo: "verificacion", userId: user.id, error: msg });
  }

  return NextResponse.json(user, { status: 201 });
}
