"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCart } from "@/hooks/useCart";
import { formatPYG } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCheckout = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setShowAuthModal(true);
      return;
    }
    closeCart();
    router.push("/checkout");
  };

  const grandTotal = total();

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrito ({items.length} {items.length === 1 ? "item" : "items"})
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground">Tu carrito está vacío</p>
              <Button variant="outline" onClick={closeCart}>
                Seguir comprando
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.imagen && (
                      <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0 bg-gray-100">
                        <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.nombre}</p>
                      <p className="text-sm text-muted-foreground">{formatPYG(item.precio)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{item.cantidad}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
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
                      <p className="text-sm font-semibold">
                        {formatPYG(item.precio * item.cantidad)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <Separator />
                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPYG(grandTotal)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Confirmar Pedido
                </Button>
                <Button variant="outline" className="w-full" onClick={closeCart}>
                  Seguir comprando
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciá sesión para continuar</DialogTitle>
            <DialogDescription>
              Para realizar tu pedido necesitás tener una cuenta.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Link href="/auth/login?redirect=/checkout" onClick={() => { setShowAuthModal(false); closeCart(); }}>
              <Button className="w-full">Iniciar sesión</Button>
            </Link>
            <Link href="/auth/registro?redirect=/checkout" onClick={() => { setShowAuthModal(false); closeCart(); }}>
              <Button variant="outline" className="w-full">Crear cuenta</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
