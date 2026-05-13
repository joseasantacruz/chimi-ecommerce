import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const caller = await prisma.users.findUnique({ where: { id: user.id } });
  return caller?.rol === "admin";
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; addressId: string }> }) {
  const { id, addressId } = await params;
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();

  if (body.is_default) {
    await prisma.addresses.updateMany({ where: { user_id: id }, data: { is_default: false } });
  }

  const address = await prisma.addresses.update({
    where: { id: addressId },
    data: {
      ...(body.alias !== undefined && { alias: body.alias }),
      ...(body.calle !== undefined && { calle: body.calle }),
      ...(body.ciudad !== undefined && { ciudad: body.ciudad }),
      ...(body.barrio !== undefined && { barrio: body.barrio }),
      ...(body.referencia !== undefined && { referencia: body.referencia }),
      ...(body.is_default !== undefined && { is_default: body.is_default }),
    },
  });
  return NextResponse.json(address);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; addressId: string }> }) {
  const { addressId } = await params;
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.addresses.delete({ where: { id: addressId } });
  return NextResponse.json({ ok: true });
}
