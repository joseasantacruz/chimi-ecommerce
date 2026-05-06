import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { UserWelcome } from "@/emails/UserWelcome";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (userRecord?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { createAdminClient } = await import("@/lib/supabase/server");
  const adminClient = await createAdminClient();

  const [dbUsers, { data: authData }] = await Promise.all([
    prisma.users.findMany({ orderBy: { created_at: "desc" } }),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const authMap = new Map((authData?.users ?? []).map((u) => [u.id, u]));

  const enriched = dbUsers.map((u) => ({
    ...u,
    email_confirmado: !!authMap.get(u.id)?.email_confirmed_at,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await prisma.users.create({
    data: {
      id: body.id,
      email: body.email,
      nombre: body.nombre,
      apellido: body.apellido,
      telefono: body.telefono,
      rol: "cliente",
    },
  });

  try {
    const config = await prisma.store_config.findFirst();
    const fromEmail = (config as typeof config & { sender_email?: string | null })?.sender_email;
    const from = fromEmail
      ? `${config?.store_name ?? "Tienda"} <${fromEmail}>`
      : `${config?.store_name ?? "Tienda"} <onboarding@resend.dev>`;

    const html = String(render(
      React.createElement(UserWelcome, {
        storeName: config?.store_name ?? "Tienda",
        primaryColor: config?.primary_color ?? "#C8511B",
        clientName: `${body.nombre ?? ""} ${body.apellido ?? ""}`.trim() || body.email,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      })
    ));

    await resend.emails.send({
      from,
      to: [body.email],
      subject: `Confirmación de usuario — ${config?.store_name ?? "Tienda"}`,
      html,
    });
  } catch (emailError) {
    console.error("Welcome email error:", emailError);
  }

  return NextResponse.json(user, { status: 201 });
}
