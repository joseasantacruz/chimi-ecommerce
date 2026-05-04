import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function PUT(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.addresses.updateMany({
    where: { user_id: user.id },
    data: { is_default: false },
  });

  const address = await prisma.addresses.update({
    where: { id: params.id },
    data: { is_default: true },
  });

  return NextResponse.json(address);
}
