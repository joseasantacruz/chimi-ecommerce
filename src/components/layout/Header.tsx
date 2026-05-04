"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { store_config } from "@prisma/client";

interface HeaderProps {
  config: store_config | null;
}

export function Header({ config }: HeaderProps) {
  const { itemCount, toggleCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email: string | undefined } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      const { data: ud } = await supabase.from("users").select("rol").eq("id", userId).single();
      setIsAdmin(ud?.rol === "admin");
    };

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email });
        fetchRole(data.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        setUser(null);
        setIsAdmin(false);
      } else {
        setUser({ email: session.user.email });
        fetchRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const count = mounted ? itemCount() : 0;

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={
          config
            ? ({
                "--store-primary": config.primary_color,
                "--store-secondary": config.secondary_color,
              } as React.CSSProperties)
            : undefined
        }
      >
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {config?.logo_url ? (
              <Image
                src={config.logo_url}
                alt={config.store_name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-lg"
                style={{ backgroundColor: config?.primary_color ?? "#C8511B" }}
              >
                {config?.store_name?.[0] ?? "E"}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="font-bold text-lg leading-none" style={{ color: config?.primary_color }}>
                {config?.store_name ?? "Tienda"}
              </p>
              {config?.slogan && (
                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                  {config.slogan}
                </p>
              )}
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/productos" className="text-sm font-medium hover:text-primary transition-colors">
              Productos
            </Link>
            <Link href="/promociones" className="text-sm font-medium hover:text-primary transition-colors">
              Promociones
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: config?.primary_color ?? "#C8511B" }}
                >
                  {count}
                </span>
              )}
            </Button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/perfil">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-1" />
                    {user.email?.split("@")[0]}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Salir
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Ingresar</Button>
                </Link>
                <Link href="/auth/registro">
                  <Button size="sm" style={{ backgroundColor: config?.primary_color }}>
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
            <Link href="/productos" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
              Productos
            </Link>
            <Link href="/promociones" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
              Promociones
            </Link>
            {isAdmin && (
              <Link href="/admin" className="block text-sm font-medium text-orange-600" onClick={() => setMobileOpen(false)}>
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link href="/perfil" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Mi Perfil
                </Link>
                <button className="block text-sm font-medium text-red-600" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Ingresar
                </Link>
                <Link href="/auth/registro" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
