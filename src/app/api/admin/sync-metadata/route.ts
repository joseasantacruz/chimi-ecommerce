import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Endpoint de uso único para sincronizar user_metadata en Supabase Auth
// con el estado actual de activo y email_verificado en nuestra DB.
// Llamar una sola vez: GET /api/admin/sync-metadata
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await prisma.users.findUnique({ where: { id: user.id } });
  if (caller?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.users.findMany({
    select: { id: true, activo: true, email_verificado: true },
  });

  const admin = await createAdminClient();
  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const u of users) {
    try {
      await admin.auth.admin.updateUserById(u.id, {
        user_metadata: { activo: u.activo, email_verificado: u.email_verificado },
      });
      results.push({ id: u.id, ok: true });
    } catch (e) {
      results.push({ id: u.id, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return NextResponse.json({ synced: results.length, results });
}
