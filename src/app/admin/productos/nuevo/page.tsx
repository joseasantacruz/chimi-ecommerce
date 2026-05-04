import { ProductForm } from "@/components/admin/ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nuevo Producto — Admin" };

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Nuevo Producto</h1>
      <ProductForm />
    </div>
  );
}
