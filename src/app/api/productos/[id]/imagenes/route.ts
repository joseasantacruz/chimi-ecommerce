import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (userRecord?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { images } = await request.json();

  // Delete existing images
  await prisma.product_images.deleteMany({ where: { product_id: params.id } });

  // Create new
  await prisma.product_images.createMany({
    data: images.map((img: { url: string; is_primary: boolean }, index: number) => ({
      product_id: params.id,
      url: img.url,
      orden: index,
      is_primary: img.is_primary,
    })),
  });

  return NextResponse.json({ success: true });
}
