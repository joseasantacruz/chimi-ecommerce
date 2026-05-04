"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { ImageGallery } from "@/components/products/ImageGallery";
import { useCart } from "@/hooks/useCart";
import { formatPYG } from "@/lib/utils";
import { toast } from "sonner";
import type { promotions, promotion_items, products, product_images, promotion_images } from "@prisma/client";

type PromotionDetail = promotions & {
  promotion_items: (promotion_items & {
    product: products & { images: product_images[] };
  })[];
  promotion_images: promotion_images[];
};

export default function PromotionDetailPage() {
  const params = useParams();
  const [promo, setPromo] = useState<PromotionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    fetch(`/api/promociones/${params.slug}`)
      .then((r) => r.json())
      .then(setPromo)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!promo) return;
    addItem({
      id: promo.id,
      type: "promotion",
      nombre: promo.nombre,
      precio: Number(promo.precio_promocional),
      imagen: promo.imagen_url ?? undefined,
      cantidad: quantity,
    });
    toast.success(`${promo.nombre} agregado al carrito`);
    openCart();
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-video rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!promo) {
    return <div className="container py-12 text-center text-muted-foreground">Promoción no encontrada.</div>;
  }

  const regularTotal = promo.promotion_items.reduce(
    (sum, item) => sum + Number(item.product.precio) * item.cantidad,
    0
  );
  const savings = regularTotal - Number(promo.precio_promocional);

  const galleryImages = promo.promotion_images?.length > 0
    ? promo.promotion_images.sort((a, b) => a.orden - b.orden)
    : promo.imagen_url
      ? [{ id: "main", url: promo.imagen_url, alt_text: promo.nombre, is_primary: true }]
      : [];

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {galleryImages.length > 0 ? (
          <ImageGallery images={galleryImages} name={promo.nombre} aspectRatio="video" />
        ) : (
          <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}

        <div className="space-y-6">
          <div>
            <Badge className="bg-green-100 text-green-800 mb-2">Promoción especial</Badge>
            <h1 className="text-3xl font-bold">{promo.nombre}</h1>
          </div>

          {promo.descripcion && (
            <p className="text-muted-foreground">{promo.descripcion}</p>
          )}

          <div>
            <p className="text-sm text-muted-foreground">
              Precio regular: <span className="line-through">{formatPYG(regularTotal)}</span>
            </p>
            <p className="text-3xl font-bold text-green-700">{formatPYG(Number(promo.precio_promocional))}</p>
            <Badge className="bg-green-600 text-white mt-2">Ahorras {formatPYG(savings)}</Badge>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Incluye:</h3>
            <ul className="space-y-2">
              {promo.promotion_items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  {item.product.images[0] && (
                    <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                      <Image src={item.product.images[0].url} alt={item.product.nombre} fill className="object-cover" />
                    </div>
                  )}
                  <span className="text-sm">
                    {item.cantidad}× {item.product.nombre}
                  </span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {formatPYG(Number(item.product.precio) * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Packs:</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Agregar al carrito — {formatPYG(Number(promo.precio_promocional) * quantity)}
          </Button>
        </div>
      </div>
    </div>
  );
}
