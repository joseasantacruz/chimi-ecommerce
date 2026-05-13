import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromotionsTable } from "./PromotionsTable";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Promociones — Admin" };

export default async function AdminPromotionsPage() {
  const promotions = await prisma.promotions.findMany({ orderBy: { created_at: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promociones</h1>
          <p className="text-muted-foreground">{promotions.length} promociones</p>
        </div>
        <Link href="/admin/promociones/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva promoción
          </Button>
        </Link>
      </div>
      <PromotionsTable data={serialize(promotions)} />
    </div>
  );
}
