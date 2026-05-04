import { notFound } from "next/navigation";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editar Promoción — Admin" };

export default async function EditPromotionPage({ params }: { params: { id: string } }) {
  const [promotion, products] = await Promise.all([
    prisma.promotions.findUnique({
      where: { id: params.id },
      include: { promotion_items: { include: { product: true } } },
    }),
    prisma.products.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  if (!promotion) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Editar: {promotion.nombre}</h1>
      <PromotionForm promotion={promotion} products={products} />
    </div>
  );
}
