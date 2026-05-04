import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (userRecord?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.users.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json(users);
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
  return NextResponse.json(user, { status: 201 });
}
