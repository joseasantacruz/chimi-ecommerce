import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/products/ProductGrid";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo completo de productos",
};

async function ProductsContent() {
  const products = await prisma.products.findMany({
    where: { activo: true },
    include: { images: true },
    orderBy: { created_at: "desc" },
  });

  return <ProductGrid products={serialize(products)} />;
}

export default async function ProductsPage() {
  const config = await prisma.store_config.findFirst();

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nuestros Productos</h1>
        <p className="text-muted-foreground mt-2">
          {config?.productos_subtitle ?? "Elaborados con ingredientes frescos y naturales"}
        </p>
      </div>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
