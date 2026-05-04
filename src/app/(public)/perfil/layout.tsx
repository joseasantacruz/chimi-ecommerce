import Link from "next/link";
import { User, MapPin, ShoppingBag, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const navItems = [
  { href: "/perfil", icon: User, label: "Mi Perfil" },
  { href: "/perfil/direcciones", icon: MapPin, label: "Direcciones" },
  { href: "/perfil/pedidos", icon: ShoppingBag, label: "Mis Pedidos" },
];

export default async function PerfilLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const userData = await prisma.users.findUnique({
      where: { id: user.id },
      select: { rol: true },
    });
    isAdmin = userData?.rol === "admin";
  }

  return (
    <div className="border-b bg-muted/40">
      <div className="container py-4">
        <nav className="flex gap-1 flex-wrap">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-orange-600 hover:bg-background hover:text-orange-700 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Panel de administración
            </Link>
          )}
        </nav>
      </div>
      {children}
    </div>
  );
}
