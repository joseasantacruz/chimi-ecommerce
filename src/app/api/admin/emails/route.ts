import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await prisma.users.findUnique({ where: { id: user.id } });
  if (caller?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const logs = await prisma.email_logs.findMany({
      orderBy: { created_at: "desc" },
      take: 200,
      include: { user: { select: { nombre: true, apellido: true } } },
    });
    return NextResponse.json(logs);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("GET /api/admin/emails error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
