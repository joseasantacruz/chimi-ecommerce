import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/server";

// Verifica activo y email_verificado usando Prisma (sin RLS).
// Recibe Authorization: Bearer <access_token> para evitar dependencia de cookies.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token requerido" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const admin = await createAdminClient();
  const { data: { user }, error } = await admin.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const record = await prisma.users.findUnique({
    where: { id: user.id },
    select: { activo: true, email_verificado: true },
  });

  if (!record) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(record);
}
