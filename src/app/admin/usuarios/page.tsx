"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { users } from "@prisma/client";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<users[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/usuarios?admin=true")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (user: users) => {
    const newRole = user.rol === "admin" ? "cliente" : "admin";
    const res = await fetch(`/api/usuarios/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol: newRole }),
    });
    if (res.ok) { toast.success("Rol actualizado"); load(); }
    else toast.error("Error al actualizar");
  };

  const toggleActive = async (user: users) => {
    const res = await fetch(`/api/usuarios/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !user.activo }),
    });
    if (res.ok) { toast.success("Usuario actualizado"); load(); }
    else toast.error("Error al actualizar");
  };

  const columns: ColumnDef<users>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => `${row.original.nombre ?? ""} ${row.original.apellido ?? ""}`,
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
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.activo ? "default" : "destructive"}>
          {row.original.activo ? "Activo" : "Inactivo"}
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
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toggleRole(row.original)}>
            {row.original.rol === "admin" ? "→ Cliente" : "→ Admin"}
          </Button>
          <Button
            size="sm"
            variant={row.original.activo ? "destructive" : "outline"}
            onClick={() => toggleActive(row.original)}
          >
            {row.original.activo ? "Desactivar" : "Activar"}
          </Button>
        </div>
      ),
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
      ) : (
        <DataTable columns={columns} data={users} searchKey="email" searchPlaceholder="Buscar por email..." />
      )}
    </div>
  );
}
