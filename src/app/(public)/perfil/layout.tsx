import Link from "next/link";
import { User, MapPin, ShoppingBag } from "lucide-react";

const navItems = [
  { href: "/perfil", icon: User, label: "Mi Perfil" },
  { href: "/perfil/direcciones", icon: MapPin, label: "Direcciones" },
  { href: "/perfil/pedidos", icon: ShoppingBag, label: "Mis Pedidos" },
];

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
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
        </nav>
      </div>
      {children}
    </div>
  );
}
