"use client";

import Link from "next/link";
import Image from "next/image";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPYG } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { products, product_images } from "@prisma/client";

type ProductRow = products & { images: product_images[] };

const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "nombre",
    header: "Producto",
    cell: ({ row }) => {
      const primary = row.original.images.find((i) => i.is_primary) ?? row.original.images[0];
      return (
        <div className="flex items-center gap-3">
          {primary ? (
            <div className="relative h-10 w-10 rounded overflow-hidden shrink-0">
              <Image src={primary.url} alt={row.original.nombre} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded bg-gray-100 shrink-0" />
          )}
          <span className="font-medium">{row.original.nombre}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "precio",
    header: "Precio",
    cell: ({ row }) => formatPYG(Number(row.original.precio)),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span className={row.original.stock === 0 ? "text-destructive font-medium" : ""}>
        {row.original.stock}
      </span>
    ),
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.activo ? "default" : "secondary"}>
        {row.original.activo ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    accessorKey: "featured",
    header: "Destacado",
    cell: ({ row }) => (row.original.featured ? "Sí" : "No"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/admin/productos/${row.original.id}/editar`}>
        <Button size="sm" variant="outline">Editar</Button>
      </Link>
    ),
  },
];

export function ProductsTable({ data }: { data: ProductRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nombre"
      searchPlaceholder="Buscar por nombre..."
    />
  );
}
