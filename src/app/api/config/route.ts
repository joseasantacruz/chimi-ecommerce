import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const config = await prisma.store_config.findFirst();
  return NextResponse.json(config);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (userRecord?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const existing = await prisma.store_config.findFirst();

  let config;
  if (existing) {
    config = await prisma.store_config.update({ where: { id: existing.id }, data: body });
  } else {
    config = await prisma.store_config.create({ data: body });
  }

  return NextResponse.json(config);
}
