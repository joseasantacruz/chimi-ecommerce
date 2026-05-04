import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const promo = await prisma.promotions.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: {
      promotion_items: { include: { product: { include: { images: true } } } },
    },
  });
  if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(promo);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (userRecord?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { items, ...data } = await request.json();

  await prisma.promotion_items.deleteMany({ where: { promotion_id: params.id } });

  const promotion = await prisma.promotions.update({
    where: { id: params.id },
    data: {
      ...data,
      fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : null,
      fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
      promotion_items: {
        create: items.map((item: { product_id: string; cantidad: number }) => ({
          product_id: item.product_id,
          cantidad: item.cantidad,
        })),
      },
    },
    include: { promotion_items: true },
  });

  return NextResponse.json(promotion);
}
