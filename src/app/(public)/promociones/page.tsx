import { Suspense } from "react";
import { Tag } from "lucide-react";
import { PromotionCard } from "@/components/promotions/PromotionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promociones",
  description: "Ofertas y packs especiales",
};

async function PromotionsContent() {
  const promotions = await prisma.promotions.findMany({
    where: { activa: true },
    include: {
      promotion_items: { include: { product: true } },
    },
    orderBy: { created_at: "desc" },
  });

  if (promotions.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Tag className="h-12 w-12 mx-auto mb-4" />
        <p>No hay promociones activas en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {promotions.map((promo) => (
        <PromotionCard key={promo.id} promotion={promo} />
      ))}
    </div>
  );
}

function PromotionsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border overflow-hidden">
          <Skeleton className="aspect-video" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Promociones</h1>
        <p className="text-muted-foreground mt-2">Packs especiales con descuentos exclusivos</p>
      </div>
      <Suspense fallback={<PromotionsSkeleton />}>
        <PromotionsContent />
      </Suspense>
    </div>
  );
}
