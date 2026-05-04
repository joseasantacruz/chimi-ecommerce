import { notFound } from "next/navigation";
import { StoreConfigForm } from "@/components/admin/StoreConfigForm";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configuración — Admin" };

export default async function AdminConfigPage() {
  const config = await prisma.store_config.findFirst();
  if (!config) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Configuración de la tienda</h1>
        <p className="text-muted-foreground">Personalizá los datos de tu negocio</p>
      </div>
      <StoreConfigForm config={config} />
    </div>
  );
}
