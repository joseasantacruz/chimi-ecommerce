import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editar Producto — Admin" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.products.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { orden: "asc" } } },
  });

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Editar: {product.nombre}</h1>
      <ProductForm product={serialize(product)} />
    </div>
  );
}
