import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { OrderStatusUpdate } from "@/emails/OrderStatusUpdate";
import React from "react";
import type { OrderStatus } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (userRecord?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { estado, notas } = await request.json();

  const currentOrder = await prisma.orders.findUnique({
    where: { id: params.id },
    include: { user: true, order_items: true },
  });
  if (!currentOrder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updatedOrder = await prisma.orders.update({
    where: { id: params.id },
    data: {
      estado: estado as OrderStatus,
      order_status_log: {
        create: {
          estado_anterior: currentOrder.estado,
          estado_nuevo: estado,
          notas: notas || null,
        },
      },
    },
  });

  // Email al cliente
  try {
    const config = await prisma.store_config.findFirst();
    const senderEmail = (config as typeof config & { sender_email?: string | null })?.sender_email;
    const from = senderEmail
      ? `${config?.store_name ?? "Tienda"} <${senderEmail}>`
      : `${config?.store_name ?? "Tienda"} <onboarding@resend.dev>`;

    const emailHtml = String(render(
      React.createElement(OrderStatusUpdate, {
        storeName: config?.store_name ?? "Tienda",
        primaryColor: config?.primary_color ?? "#C8511B",
        clientName: `${currentOrder.user.nombre ?? ""} ${currentOrder.user.apellido ?? ""}`.trim(),
        orderId: currentOrder.id,
        newStatus: estado as OrderStatus,
        notes: notas,
        items: currentOrder.order_items.map((i) => ({
          nombre_snapshot: i.nombre_snapshot,
          cantidad: i.cantidad,
          subtotal: Number(i.subtotal),
        })),
        total: Number(currentOrder.total),
        contactWhatsapp: config?.contact_whatsapp ?? undefined,
        contactPhone: config?.contact_phone ?? undefined,
      })
    ));

    await resend.emails.send({
      from,
      to: [currentOrder.user.email],
      subject: `Tu pedido #${currentOrder.id.slice(-8).toUpperCase()} fue actualizado - ${config?.store_name}`,
      html: emailHtml,
    });
  } catch (emailError) {
    console.error("Email error:", emailError);
  }

  return NextResponse.json(updatedOrder);
}
