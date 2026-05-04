import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const promotions = await prisma.promotions.findMany({
    where: { activa: true },
    include: { promotion_items: { include: { product: { include: { images: true } } } } },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(promotions);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (userRecord?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { items, ...data } = await request.json();

  const promotion = await prisma.promotions.create({
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

  return NextResponse.json(promotion, { status: 201 });
}
