import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRecord = await prisma.users.findUnique({ where: { id: user.id } });
  if (userRecord?.rol !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { images } = await request.json() as {
    images: { url: string; is_primary: boolean }[];
  };

  await prisma.promotion_images.deleteMany({ where: { promotion_id: params.id } });

  if (images.length > 0) {
    await prisma.promotion_images.createMany({
      data: images.map((img, index) => ({
        promotion_id: params.id,
        url: img.url,
        orden: index,
        is_primary: img.is_primary,
      })),
    });

    const primaryImage = images.find((i) => i.is_primary) ?? images[0];
    await prisma.promotions.update({
      where: { id: params.id },
      data: { imagen_url: primaryImage.url },
    });
  }

  return NextResponse.json({ success: true });
}
