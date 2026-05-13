import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const caller = await prisma.users.findUnique({ where: { id: user.id } });
  return caller?.rol === "admin" ? caller : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.users.findUnique({
    where: { id },
    include: { addresses: { orderBy: [{ is_default: "desc" }, { created_at: "desc" }] } },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();

  const updated = await prisma.users.update({
    where: { id },
    data: {
      ...(body.rol !== undefined && { rol: body.rol }),
      ...(body.activo !== undefined && { activo: body.activo }),
      ...(body.nombre !== undefined && { nombre: body.nombre }),
      ...(body.apellido !== undefined && { apellido: body.apellido }),
      ...(body.telefono !== undefined && { telefono: body.telefono }),
      ...(body.ruc !== undefined && { ruc: body.ruc }),
      ...(body.denominacion !== undefined && { denominacion: body.denominacion }),
    },
  });

  // Sincronizar activo en Supabase Auth metadata si cambió
  if (body.activo !== undefined) {
    try {
      const admin = await createAdminClient();
      await admin.auth.admin.updateUserById(id, {
        user_metadata: { activo: body.activo },
      });
    } catch { /* no bloquear */ }
  }

  return NextResponse.json(updated);
}
