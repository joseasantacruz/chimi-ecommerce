"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { formatPYG, formatDate } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { orders, users } from "@prisma/client";

type OrderRow = orders & { user: users };

const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "id",
    header: "Pedido",
    cell: ({ row }) => (
      <Link href={`/admin/ordenes/${row.original.id}`} className="font-mono text-sm hover:underline">
        #{row.original.id.slice(-8).toUpperCase()}
      </Link>
    ),
  },
  {
    id: "cliente",
    header: "Cliente",
    accessorFn: (row) => `${row.user.nombre} ${row.user.apellido}`,
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.user.nombre} {row.original.user.apellido}</p>
        <p className="text-xs text-muted-foreground">{row.original.user.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => <OrderStatusBadge status={row.original.estado} />,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => formatPYG(Number(row.original.total)),
  },
  {
    accessorKey: "created_at",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/admin/ordenes/${row.original.id}`}>
        <Button size="sm" variant="outline">Ver</Button>
      </Link>
    ),
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filtered, setFiltered] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ordenes?admin=true")
      .then((r) => r.json())
      .then((data) => { setOrders(data); setFiltered(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = useCallback(({ search, estado, from, to }: { search: string; estado: string; from: string; to: string }) => {
    let result = [...orders];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (o) =>
          `${o.user.nombre} ${o.user.apellido}`.toLowerCase().includes(s) ||
          o.user.email.toLowerCase().includes(s)
      );
    }
    if (estado && estado !== "all") result = result.filter((o) => o.estado === estado);
    if (from) result = result.filter((o) => new Date(o.created_at) >= new Date(from));
    if (to) result = result.filter((o) => new Date(o.created_at) <= new Date(to + "T23:59:59"));
    setFiltered(result);
  }, [orders]);

  const exportCSV = () => {
    const rows = [
      ["ID", "Cliente", "Email", "Estado", "Total", "Fecha"],
      ...filtered.map((o) => [
        `#${o.id.slice(-8).toUpperCase()}`,
        `${o.user.nombre} ${o.user.apellido}`,
        o.user.email,
        o.estado,
        Number(o.total).toString(),
        new Date(o.created_at).toLocaleDateString("es-PY"),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ordenes-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Órdenes</h1>
          <p className="text-muted-foreground">{filtered.length} resultados</p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <OrderFilters onFilter={handleFilter} />

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
    </div>
  );
}
