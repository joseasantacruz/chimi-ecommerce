import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { OrderConfirmationClient } from "@/emails/OrderConfirmationClient";
import { OrderConfirmationAdmin } from "@/emails/OrderConfirmationAdmin";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const isAdmin = searchParams.get("admin") === "true";

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });

  let orders;
  if (isAdmin && userRecord?.rol === "admin") {
    orders = await prisma.orders.findMany({
      include: { user: true, order_items: true },
      orderBy: { created_at: "desc" },
    });
  } else {
    orders = await prisma.orders.findMany({
      where: { user_id: user.id },
      include: { order_items: true },
      orderBy: { created_at: "desc" },
    });
  }

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { items, address_id, new_address, save_address, ruc_factura, denominacion_factura, notas_cliente, subtotal, total } = body;

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (!userRecord) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let finalAddressId = address_id;

  if (new_address) {
    let addressData = { ...new_address, user_id: user.id };
    if (save_address) {
      const addr = await prisma.addresses.create({ data: addressData });
      finalAddressId = addr.id;
    }
  }

  const config = await prisma.store_config.findFirst();

  const order = await prisma.orders.create({
    data: {
      user_id: user.id,
      address_id: finalAddressId || null,
      ruc_factura: ruc_factura || null,
      denominacion_factura: denominacion_factura || null,
      notas_cliente: notas_cliente || null,
      subtotal,
      total,
      estado: "pendiente_confirmacion",
      order_items: {
        create: items.map((item: {
          id: string;
          type: "product" | "promotion";
          nombre_snapshot: string;
          precio_snapshot: number;
          cantidad: number;
          subtotal: number;
        }) => ({
          product_id: item.type === "product" ? item.id : null,
          promotion_id: item.type === "promotion" ? item.id : null,
          nombre_snapshot: item.nombre_snapshot,
          precio_snapshot: item.precio_snapshot,
          cantidad: item.cantidad,
          subtotal: item.subtotal,
        })),
      },
      order_status_log: {
        create: {
          estado_nuevo: "pendiente_confirmacion",
          notas: "Pedido creado",
        },
      },
    },
    include: { order_items: true, address: true },
  });

  // Enviar emails
  try {
    const emailItems = order.order_items.map((i) => ({
      nombre_snapshot: i.nombre_snapshot,
      cantidad: i.cantidad,
      precio_snapshot: Number(i.precio_snapshot),
      subtotal: Number(i.subtotal),
    }));

    const clientHtml = String(render(
      React.createElement(OrderConfirmationClient, {
        storeName: config?.store_name ?? "Tienda",
        primaryColor: config?.primary_color ?? "#C8511B",
        clientName: `${userRecord.nombre ?? ""} ${userRecord.apellido ?? ""}`.trim(),
        orderId: order.id,
        orderDate: order.created_at.toISOString(),
        items: emailItems,
        total: Number(order.total),
        address: order.address,
        contactWhatsapp: config?.contact_whatsapp ?? undefined,
      })
    ));

    await resend.emails.send({
      from: `${config?.store_name ?? "Tienda"} <onboarding@resend.dev>`,
      to: [userRecord.email],
      subject: `¡Recibimos tu pedido #${order.id.slice(-8).toUpperCase()}! - ${config?.store_name}`,
      html: clientHtml,
    });

    if (config?.contact_email) {
      const adminHtml = String(render(
        React.createElement(OrderConfirmationAdmin, {
          storeName: config.store_name,
          primaryColor: config.primary_color,
          orderId: order.id,
          orderDate: order.created_at.toISOString(),
          client: {
            nombre: userRecord.nombre ?? "",
            apellido: userRecord.apellido ?? "",
            email: userRecord.email,
            telefono: userRecord.telefono ?? undefined,
          },
          items: emailItems,
          total: Number(order.total),
          address: order.address,
          ruc: ruc_factura,
          denominacion: denominacion_factura,
          notasCliente: notas_cliente,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        })
      ));

      await resend.emails.send({
        from: `${config.store_name} <onboarding@resend.dev>`,
        to: [config.contact_email],
        subject: `Nueva orden #${order.id.slice(-8).toUpperCase()} de ${userRecord.nombre} ${userRecord.apellido}`,
        html: adminHtml,
      });
    }
  } catch (emailError) {
    console.error("Email error:", emailError);
  }

  return NextResponse.json(order, { status: 201 });
}
