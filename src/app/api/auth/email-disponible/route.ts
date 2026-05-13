import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const exists = await prisma.users.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true },
  });

  return NextResponse.json({ disponible: !exists });
}
