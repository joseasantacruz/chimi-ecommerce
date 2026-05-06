import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { PasswordReset } from "@/emails/PasswordReset";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const config = await prisma.store_config.findFirst();
  const fromEmail = (config as typeof config & { sender_email?: string | null })?.sender_email;
  const from = fromEmail
    ? `${config?.store_name ?? "Tienda"} <${fromEmail}>`
    : `${config?.store_name ?? "Tienda"} <onboarding@resend.dev>`;

  const html = String(render(
    React.createElement(PasswordReset, {
      storeName: config?.store_name ?? "Tienda",
      primaryColor: config?.primary_color ?? "#C8511B",
      clientName: `${target.nombre ?? ""} ${target.apellido ?? ""}`.trim() || target.email,
      resetUrl: linkData.properties.action_link,
    })
  ));

  await resend.emails.send({
    from,
    to: [target.email],
    subject: `Restablecer contraseña — ${config?.store_name ?? "Tienda"}`,
    html,
  });

  return NextResponse.json({ ok: true });
}
