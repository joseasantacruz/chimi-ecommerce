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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();

  if (body.is_default) {
    await prisma.addresses.updateMany({ where: { user_id: id }, data: { is_default: false } });
  }

  const address = await prisma.addresses.create({
    data: { ...body, user_id: id },
  });
  return NextResponse.json(address, { status: 201 });
}
