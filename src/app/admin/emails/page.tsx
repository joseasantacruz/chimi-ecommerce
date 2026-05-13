"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/DataTable";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

type EmailLog = {
  id: string;
  to: string;
  subject: string;
  tipo: string;
  estado: string;
  error_msg: string | null;
  resend_id: string | null;
  created_at: string;
  user: { nombre: string | null; apellido: string | null } | null;
};

const TIPO_LABELS: Record<string, string> = {
  verificacion: "Verificación",
  reset_password: "Reset contraseña",
  confirmacion_orden: "Confirmación orden",
  actualizacion_estado: "Actualización estado",
  bienvenida: "Bienvenida",
};

export default function AdminEmailsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/emails")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Error");
        return data;
      })
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnDef<EmailLog>[] = [
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => formatDate(new Date(row.original.created_at)),
    },
    {
      accessorKey: "to",
      header: "Destinatario",
      cell: ({ row }) => {
        const u = row.original.user;
        const nombre = u ? `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim() : null;
        return (
          <div>
            <div className="font-medium text-sm">{row.original.to}</div>
            {nombre && <div className="text-xs text-muted-foreground">{nombre}</div>}
          </div>
        );
      },
    },
    { accessorKey: "subject", header: "Asunto" },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="secondary">{TIPO_LABELS[row.original.tipo] ?? row.original.tipo}</Badge>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.estado === "enviado" ? "default" : "destructive"}>
          {row.original.estado === "enviado" ? "Enviado" : "Error"}
        </Badge>
      ),
    },
    {
      accessorKey: "error_msg",
      header: "Detalle",
      cell: ({ row }) =>
        row.original.error_msg ? (
          <span className="text-xs text-red-500 font-mono">{row.original.error_msg}</span>
        ) : row.original.resend_id ? (
          <span className="text-xs text-muted-foreground font-mono">{row.original.resend_id}</span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Log de emails</h1>
        <p className="text-muted-foreground">Últimos {logs.length} emails enviados</p>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DataTable columns={columns} data={logs} searchKey="to" searchPlaceholder="Buscar por email..." />
      )}
    </div>
  );
}
