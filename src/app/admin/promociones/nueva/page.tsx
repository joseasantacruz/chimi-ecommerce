import { PromotionForm } from "@/components/admin/PromotionForm";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nueva Promoción — Admin" };

export default async function NewPromotionPage() {
  const products = await prisma.products.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Nueva Promoción</h1>
      <PromotionForm products={serialize(products)} />
    </div>
  );
}
