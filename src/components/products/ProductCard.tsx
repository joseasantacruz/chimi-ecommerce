"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPYG } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import type { products, product_images } from "@prisma/client";

interface ProductCardProps {
  product: products & { images: product_images[] };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addItem({
      id: product.id,
      type: "product",
      nombre: product.nombre,
      precio: Number(product.precio),
      imagen: primaryImage?.url,
      stock: product.stock,
    });
    toast.success(`${product.nombre} agregado al carrito`);
    openCart();
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/productos/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? product.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Sin imagen
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Sin stock</Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-semibold text-sm line-clamp-2 hover:underline">{product.nombre}</h3>
        </Link>
        {product.descripcion && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.descripcion}</p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="font-bold text-lg">{formatPYG(Number(product.precio))}</span>
        <Button
          size="sm"
          disabled={product.stock === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Agregar al carrito</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
