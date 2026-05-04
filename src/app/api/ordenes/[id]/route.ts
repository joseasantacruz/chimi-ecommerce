import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.orders.findUnique({
    where: { id: params.id },
    include: {
      order_items: true,
      order_status_log: { orderBy: { created_at: "asc" } },
      address: true,
      user: true,
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (order.user_id !== user.id && userRecord?.rol !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (userRecord?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const order = await prisma.orders.update({ where: { id: params.id }, data: body });
  return NextResponse.json(order);
}
