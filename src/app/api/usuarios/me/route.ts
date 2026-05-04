import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (!userRecord) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(userRecord);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updated = await prisma.users.update({
    where: { id: user.id },
    data: {
      nombre: body.nombre,
      apellido: body.apellido,
      telefono: body.telefono,
      ruc: body.ruc,
      denominacion: body.denominacion,
    },
  });
  return NextResponse.json(updated);
}
