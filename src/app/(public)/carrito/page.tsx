"use client";

import { useCart } from "@/hooks/useCart";
import { formatPYG } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCheckout = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setShowAuthModal(true);
      return;
    }
    router.push("/checkout");
  };

  const grandTotal = total();

  if (items.length === 0) {
    return (
      <div className="container py-20 flex flex-col items-center gap-6 text-center">
        <ShoppingCart className="h-20 w-20 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground">Agregá productos para empezar tu pedido.</p>
        <Link href="/productos">
          <Button size="lg">Ver productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-8">Tu carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-lg border bg-card">
              {item.imagen && (
                <div className="relative h-20 w-20 rounded overflow-hidden shrink-0 bg-gray-100">
                  <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold line-clamp-2">{item.nombre}</p>
                <p className="text-sm text-muted-foreground mt-1">{formatPYG(item.precio)} c/u</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                    disabled={item.stock !== undefined && item.cantidad >= item.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <p className="font-bold">{formatPYG(item.precio * item.cantidad)}</p>
              </div>
            </div>
          ))}

          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearCart}>
            Vaciar carrito
          </Button>
        </div>

        {/* Resumen */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Resumen</h2>
            <Separator />
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.nombre} ×{item.cantidad}</span>
                <span>{formatPYG(item.precio * item.cantidad)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPYG(grandTotal)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Finalizar pedido
            </Button>
            <Link href="/productos">
              <Button variant="outline" className="w-full">Seguir comprando</Button>
            </Link>
          </div>
        </div>
      </div>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciá sesión para continuar</DialogTitle>
            <DialogDescription>
              Necesitás una cuenta para realizar tu pedido.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Link href="/auth/login?redirect=/checkout" onClick={() => setShowAuthModal(false)}>
              <Button className="w-full">Iniciar sesión</Button>
            </Link>
            <Link href="/auth/registro?redirect=/checkout" onClick={() => setShowAuthModal(false)}>
              <Button variant="outline" className="w-full">Crear cuenta</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
