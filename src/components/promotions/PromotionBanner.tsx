import Link from "next/link";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromotionCard } from "./PromotionCard";
import type { promotions, promotion_items, products } from "@prisma/client";

type PromotionWithItems = promotions & {
  promotion_items: (promotion_items & { product: products })[];
};

interface PromotionBannerProps {
  promotions: PromotionWithItems[];
  subtitle?: string | null;
}

export function PromotionBanner({ promotions, subtitle }: PromotionBannerProps) {
  if (promotions.length === 0) return null;

  return (
    <section className="py-16 bg-amber-50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Tag className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Promociones Activas</h2>
              <p className="text-sm text-muted-foreground">{subtitle ?? "Ofertas especiales por tiempo limitado"}</p>
            </div>
          </div>
          <Link href="/promociones">
            <Button variant="outline">Ver todas</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <PromotionCard key={promo.id} promotion={promo} />
          ))}
        </div>
      </div>
    </section>
  );
}
