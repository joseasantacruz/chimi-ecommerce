import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { render } from "@react-email/render";
import { PasswordReset } from "@/emails/PasswordReset";
import { sendEmail } from "@/lib/resend-send";
import { logEmail } from "@/lib/email-log";
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

  const adminClient = await createAdminClient();

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email: target.email,
  });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: "No se pudo generar el enlace de recuperación" }, { status: 500 });
  }

  const subject = `Restablecer contraseña`;

  try {
    const config = await prisma.store_config.findFirst();
    const storeName = config?.store_name ?? "Tienda";
    const fromEmail = (config as typeof config & { sender_email?: string | null })?.sender_email;
    const from = fromEmail
      ? `${storeName} <${fromEmail}>`
      : `${storeName} <onboarding@resend.dev>`;

    const html = String(render(
      React.createElement(PasswordReset, {
        storeName,
        primaryColor: config?.primary_color ?? "#C8511B",
        clientName: `${target.nombre ?? ""} ${target.apellido ?? ""}`.trim() || target.email,
        resetUrl: linkData.properties.action_link,
      })
    ));

    const { id: resendId } = await sendEmail({ from, to: [target.email], subject, html }, storeName);
    await logEmail({ to: target.email, subject, tipo: "reset_password", userId: target.id, resendId });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logEmail({ to: target.email, subject, tipo: "reset_password", userId: target.id, error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
