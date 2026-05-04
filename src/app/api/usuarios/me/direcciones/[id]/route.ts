import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const address = await prisma.addresses.findFirst({ where: { id: params.id, user_id: user.id } });
  if (!address) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.addresses.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
