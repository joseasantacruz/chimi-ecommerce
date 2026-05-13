import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

  const user = await prisma.users.findUnique({ where: { verification_token: token } });
  if (!user) return NextResponse.json({ error: "Token inválido o ya utilizado" }, { status: 404 });

  await prisma.users.update({
    where: { id: user.id },
    data: { email_verificado: true, verification_token: null },
  });

  // Sincronizar en Supabase Auth metadata
  try {
    const admin = await createAdminClient();
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { email_verificado: true },
    });
  } catch { /* no bloquear si falla */ }

  return NextResponse.json({ ok: true });
}
