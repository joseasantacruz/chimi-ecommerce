import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { hexToHslString } from "@/lib/utils";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/admin");
  }

  const userRecord = await prisma.users.findUnique({
    where: { id: user.id },
    select: { rol: true },
  });

  if (!userRecord || userRecord.rol !== "admin") {
    redirect("/");
  }

  const config = await prisma.store_config.findFirst();
  const buttonHsl = config?.button_color ? hexToHslString(config.button_color) : null;

  return (
    <div
      className="flex min-h-screen"
      style={buttonHsl ? ({ "--primary": buttonHsl, "--ring": buttonHsl } as React.CSSProperties) : undefined}
    >
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50 overflow-auto">{children}</main>
    </div>
  );
}
