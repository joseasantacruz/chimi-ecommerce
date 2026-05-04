import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await prisma.users.findUnique({ where: { id: user.id } });
  if (caller?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();

  const updated = await prisma.users.update({
    where: { id: params.id },
    data: {
      ...(body.rol !== undefined && { rol: body.rol }),
      ...(body.activo !== undefined && { activo: body.activo }),
    },
  });

  return NextResponse.json(updated);
}
