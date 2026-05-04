"use client";

import Link from "next/link";
import Image from "next/image";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPYG, formatDate } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { promotions } from "@prisma/client";

const columns: ColumnDef<promotions>[] = [
  {
    accessorKey: "nombre",
    header: "Promoción",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.imagen_url ? (
          <div className="relative h-10 w-16 rounded overflow-hidden shrink-0">
            <Image src={row.original.imagen_url} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="h-10 w-16 rounded bg-gray-100 shrink-0" />
        )}
        <span className="font-medium">{row.original.nombre}</span>
      </div>
    ),
  },
  {
    accessorKey: "precio_promocional",
    header: "Precio",
    cell: ({ row }) => formatPYG(Number(row.original.precio_promocional)),
  },
  {
    accessorKey: "activa",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.activa ? "default" : "secondary"}>
        {row.original.activa ? "Activa" : "Inactiva"}
      </Badge>
    ),
  },
  {
    accessorKey: "fecha_inicio",
    header: "Inicio",
    cell: ({ row }) =>
      row.original.fecha_inicio ? formatDate(row.original.fecha_inicio) : "—",
  },
  {
    accessorKey: "fecha_fin",
    header: "Fin",
    cell: ({ row }) =>
      row.original.fecha_fin ? formatDate(row.original.fecha_fin) : "—",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/admin/promociones/${row.original.id}/editar`}>
        <Button size="sm" variant="outline">Editar</Button>
      </Link>
    ),
  },
];

export function PromotionsTable({ data }: { data: promotions[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nombre"
      searchPlaceholder="Buscar por nombre..."
    />
  );
}
