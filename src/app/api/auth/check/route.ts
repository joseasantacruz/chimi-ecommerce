import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint público — solo devuelve activo y email_verificado por ID.
// El ID viene del signInWithPassword response (ya autenticado en el cliente).
// No requiere sesión server-side, evita interferencia con cookies/tokens.
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid requerido" }, { status: 400 });

  const record = await prisma.users.findUnique({
    where: { id: uid },
    select: { activo: true, email_verificado: true, rol: true, nombre: true, apellido: true },
  });

  if (!record) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json(record);
}
