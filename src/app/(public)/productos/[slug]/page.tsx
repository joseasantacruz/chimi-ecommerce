"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "@/components/products/ImageGallery";
import { useCart } from "@/hooks/useCart";
import { formatPYG } from "@/lib/utils";
import { toast } from "sonner";
import type { products, product_images } from "@prisma/client";

type ProductDetail = products & { images: product_images[] };

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    fetch(`/api/productos/${params.slug}`)
      .then((r) => r.json())
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addItem({
      id: product.id,
      type: "product",
      nombre: product.nombre,
      precio: Number(product.precio),
      imagen: product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url,
      stock: product.stock,
      cantidad: quantity,
    });
    toast.success(`${product.nombre} agregado al carrito`);
    openCart();
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Producto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ImageGallery images={product.images} name={product.nombre} />

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.nombre}</h1>
            {product.stock === 0 ? (
              <Badge variant="destructive" className="mt-2">Sin stock</Badge>
            ) : (
              <Badge variant="outline" className="mt-2 text-green-700 border-green-300">
                {product.stock} disponibles
              </Badge>
            )}
          </div>

          <p className="text-3xl font-bold text-primary">{formatPYG(Number(product.precio))}</p>

          {product.descripcion && (
            <p className="text-muted-foreground leading-relaxed">{product.descripcion}</p>
          )}

          {product.ingredientes && (
            <div>
              <Separator className="mb-4" />
              <h3 className="font-semibold mb-2">Ingredientes</h3>
              <p className="text-sm text-muted-foreground">{product.ingredientes}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Cantidad:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
