import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.addresses.findMany({
    where: { user_id: user.id },
    orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
  });
  return NextResponse.json(addresses);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.is_default) {
    await prisma.addresses.updateMany({
      where: { user_id: user.id },
      data: { is_default: false },
    });
  }

  const address = await prisma.addresses.create({
    data: { ...body, user_id: user.id },
  });
  return NextResponse.json(address, { status: 201 });
}
