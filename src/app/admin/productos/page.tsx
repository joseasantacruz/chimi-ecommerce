import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "./ProductsTable";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos — Admin" };

export default async function AdminProductsPage() {
  const products = await prisma.products.findMany({
    include: { images: true },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-muted-foreground">{products.length} productos en total</p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo producto
          </Button>
        </Link>
      </div>
      <ProductsTable data={serialize(products)} />
    </div>
  );
}
