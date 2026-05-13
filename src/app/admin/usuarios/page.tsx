"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Mail, KeyRound, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { users } from "@prisma/client";

type EnrichedUser = users;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const load = () => {
    setError(null);
    fetch("/api/usuarios")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Error al cargar usuarios");
        return data;
      })
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (user: EnrichedUser) => {
    const newRole = user.rol === "admin" ? "cliente" : "admin";
    const res = await fetch(`/api/usuarios/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol: newRole }),
    });
    if (res.ok) { toast.success("Rol actualizado"); load(); }
    else toast.error("Error al actualizar");
  };

  const toggleActive = async (user: EnrichedUser) => {
    const res = await fetch(`/api/usuarios/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !user.activo }),
    });
    if (res.ok) { toast.success("Usuario actualizado"); load(); }
    else toast.error("Error al actualizar");
  };

  const reenviarVerificacion = async (user: EnrichedUser) => {
    setActionLoading(`verify-${user.id}`);
    const res = await fetch(`/api/usuarios/${user.id}/reenviar-verificacion`, { method: "POST" });
    if (res.ok) toast.success("Email de verificación enviado");
    else toast.error("Error al enviar el email");
    setActionLoading(null);
  };

  const resetPassword = async (user: EnrichedUser) => {
    setActionLoading(`reset-${user.id}`);
    const res = await fetch(`/api/usuarios/${user.id}/reset-password`, { method: "POST" });
    if (res.ok) toast.success("Email de restablecimiento enviado");
    else toast.error("Error al enviar el email");
    setActionLoading(null);
  };

  const columns: ColumnDef<EnrichedUser>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => `${row.original.nombre ?? ""} ${row.original.apellido ?? ""}`.trim() || "—",
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "telefono", header: "Teléfono", cell: ({ row }) => row.original.telefono ?? "—" },
    {
      accessorKey: "rol",
      header: "Rol",
      cell: ({ row }) => (
        <Badge variant={row.original.rol === "admin" ? "default" : "secondary"}>
          {row.original.rol}
        </Badge>
      ),
    },
    {
      accessorKey: "email_verificado",
      header: "Email",
      cell: ({ row }) => (
        <Badge variant={row.original.email_verificado ? "default" : "outline"}>
          {row.original.email_verificado ? "Verificado" : "Pendiente"}
        </Badge>
      ),
    },
    {
      accessorKey: "activo",
      header: "Cuenta",
      cell: ({ row }) => (
        <Badge variant={row.original.activo ? "secondary" : "destructive"}>
          {row.original.activo ? "Activa" : "Inactiva"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Registro",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const u = row.original;
        const isVerifyLoading = actionLoading === `verify-${u.id}`;
        const isResetLoading = actionLoading === `reset-${u.id}`;
        return (
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" onClick={() => router.push(`/admin/usuarios/${u.id}`)}>
              <Pencil className="h-3 w-3 mr-1" />Editar
            </Button>
            <Button size="sm" variant="outline" onClick={() => toggleRole(u)}>
              {u.rol === "admin" ? "→ Cliente" : "→ Admin"}
            </Button>
            <Button
              size="sm"
              variant={u.activo ? "destructive" : "outline"}
              onClick={() => toggleActive(u)}
            >
              {u.activo ? "Desactivar" : "Activar"}
            </Button>
            {!u.email_verificado && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => reenviarVerificacion(u)}
                disabled={isVerifyLoading}
                title="Reenviar email de verificación"
              >
                {isVerifyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                <span className="ml-1">Verificar</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => resetPassword(u)}
              disabled={isResetLoading}
              title="Enviar email de restablecimiento de contraseña"
            >
              {isResetLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <KeyRound className="h-3 w-3" />}
              <span className="ml-1">Reset pwd</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">{users.length} usuarios registrados</p>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DataTable columns={columns} data={users} searchKey="email" searchPlaceholder="Buscar por email..." />
      )}
    </div>
  );
}
