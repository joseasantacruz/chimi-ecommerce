"use client";

import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPYG } from "@/lib/utils";
import type { promotions, promotion_items, products } from "@prisma/client";

type PromotionWithItems = promotions & {
  promotion_items: (promotion_items & { product: products })[];
};

interface PromotionCardProps {
  promotion: PromotionWithItems;
}

export function PromotionCard({ promotion }: PromotionCardProps) {
  const regularTotal = promotion.promotion_items.reduce(
    (sum, item) => sum + Number(item.product.precio) * item.cantidad,
    0
  );
  const savings = regularTotal - Number(promotion.precio_promocional);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/promociones/${promotion.slug}`}>
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {promotion.imagen_url ? (
            <Image
              src={promotion.imagen_url}
              alt={promotion.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Tag className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="bg-green-600 text-white">
              Ahorras {formatPYG(savings)}
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/promociones/${promotion.slug}`}>
          <h3 className="font-semibold hover:underline">{promotion.nombre}</h3>
        </Link>
        {promotion.descripcion && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{promotion.descripcion}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-muted-foreground line-through">{formatPYG(regularTotal)}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="font-bold text-lg text-green-700">
          {formatPYG(Number(promotion.precio_promocional))}
        </span>
        <Link href={`/promociones/${promotion.slug}`}>
          <Button size="sm" variant="outline">Ver oferta</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
