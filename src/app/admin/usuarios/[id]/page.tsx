"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { addresses } from "@prisma/client";

const userSchema = z.object({
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  ruc: z.string().optional(),
  denominacion: z.string().optional(),
  rol: z.enum(["admin", "cliente"]),
  activo: z.boolean(),
});

const addressSchema = z.object({
  alias: z.string().min(1, "Requerido"),
  calle: z.string().min(1, "Requerido"),
  ciudad: z.string().min(1, "Requerido"),
  barrio: z.string().optional(),
  referencia: z.string().optional(),
  is_default: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof userSchema>;
type AddressFormValues = z.infer<typeof addressSchema>;

type UserData = {
  id: string; email: string; nombre: string | null; apellido: string | null;
  telefono: string | null; ruc: string | null; denominacion: string | null;
  rol: string; activo: boolean; email_verificado: boolean; created_at: string;
  addresses: addresses[];
};

export default function AdminEditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);
  const [addressMode, setAddressMode] = useState<"idle" | "new" | { editing: addresses }>("idle");

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { nombre: "", apellido: "", telefono: "", ruc: "", denominacion: "", rol: "cliente", activo: true },
  });

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { alias: "", calle: "", ciudad: "", barrio: "", referencia: "", is_default: false },
  });

  const load = async () => {
    const res = await fetch(`/api/usuarios/${userId}`);
    if (!res.ok) { toast.error("Usuario no encontrado"); router.push("/admin/usuarios"); return; }
    const data: UserData = await res.json();
    setUser(data);
    userForm.reset({
      nombre: data.nombre ?? "",
      apellido: data.apellido ?? "",
      telefono: data.telefono ?? "",
      ruc: data.ruc ?? "",
      denominacion: data.denominacion ?? "",
      rol: data.rol as "admin" | "cliente",
      activo: data.activo,
    });
  };

  useEffect(() => { load(); }, [userId]);

  const saveUser = async (values: UserFormValues) => {
    setSaving(true);
    const res = await fetch(`/api/usuarios/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) { toast.success("Usuario actualizado"); load(); }
    else toast.error("Error al guardar");
  };

  const saveAddress = async (values: AddressFormValues) => {
    setSaving(true);
    const isEditing = addressMode !== "idle" && addressMode !== "new";
    const url = isEditing
      ? `/api/usuarios/${userId}/direcciones/${(addressMode as { editing: addresses }).editing.id}`
      : `/api/usuarios/${userId}/direcciones`;
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) { toast.success(isEditing ? "Dirección actualizada" : "Dirección agregada"); setAddressMode("idle"); load(); }
    else toast.error("Error al guardar dirección");
  };

  const deleteAddress = async (addressId: string) => {
    if (!confirm("¿Eliminar esta dirección?")) return;
    const res = await fetch(`/api/usuarios/${userId}/direcciones/${addressId}`, { method: "DELETE" });
    if (res.ok) { toast.success("Dirección eliminada"); load(); }
    else toast.error("Error al eliminar");
  };

  const startEdit = (address: addresses) => {
    setAddressMode({ editing: address });
    addressForm.reset({
      alias: address.alias, calle: address.calle, ciudad: address.ciudad,
      barrio: address.barrio ?? "", referencia: address.referencia ?? "",
      is_default: address.is_default,
    });
  };

  const startNew = () => {
    setAddressMode("new");
    addressForm.reset({ alias: "", calle: "", ciudad: "", barrio: "", referencia: "", is_default: false });
  };

  if (!user) return <div className="text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/usuarios")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {user.nombre || user.apellido ? `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim() : user.email}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant={user.email_verificado ? "default" : "outline"}>
            {user.email_verificado ? "Email verificado" : "Pendiente"}
          </Badge>
          <Badge variant={user.activo ? "secondary" : "destructive"}>
            {user.activo ? "Activa" : "Inactiva"}
          </Badge>
        </div>
      </div>

      {/* Datos del usuario */}
      <Card>
        <CardHeader><CardTitle>Datos personales</CardTitle></CardHeader>
        <CardContent>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(saveUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={userForm.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={userForm.control} name="apellido" render={({ field }) => (
                  <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={userForm.control} name="telefono" render={({ field }) => (
                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={userForm.control} name="ruc" render={({ field }) => (
                  <FormItem><FormLabel>RUC</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={userForm.control} name="denominacion" render={({ field }) => (
                  <FormItem><FormLabel>Denominación</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={userForm.control} name="rol" render={({ field }) => (
                  <FormItem><FormLabel>Rol</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                <FormField control={userForm.control} name="activo" render={({ field }) => (
                  <FormItem><FormLabel>Estado</FormLabel>
                    <Select value={field.value ? "true" : "false"} onValueChange={(v) => field.onChange(v === "true")}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="true">Activa</SelectItem>
                        <SelectItem value="false">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Guardar cambios
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Direcciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Direcciones ({user.addresses.length})</CardTitle>
            {addressMode === "idle" && (
              <Button size="sm" onClick={startNew}>
                <Plus className="h-4 w-4 mr-1" /> Agregar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {addressMode !== "idle" && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium mb-3">
                {addressMode === "new" ? "Nueva dirección" : "Editar dirección"}
              </p>
              <Form {...addressForm}>
                <form onSubmit={addressForm.handleSubmit(saveAddress)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={addressForm.control} name="alias" render={({ field }) => (
                      <FormItem><FormLabel>Alias</FormLabel><FormControl><Input placeholder="Casa, Trabajo..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={addressForm.control} name="ciudad" render={({ field }) => (
                      <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={addressForm.control} name="calle" render={({ field }) => (
                    <FormItem><FormLabel>Calle / Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={addressForm.control} name="barrio" render={({ field }) => (
                      <FormItem><FormLabel>Barrio</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={addressForm.control} name="referencia" render={({ field }) => (
                      <FormItem><FormLabel>Referencia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={saving}>
                      {saving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                      Guardar
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setAddressMode("idle")}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {user.addresses.length === 0 && addressMode === "idle" && (
            <p className="text-sm text-muted-foreground">Sin direcciones registradas.</p>
          )}

          {user.addresses.map((addr) => (
            <div key={addr.id} className="flex items-start justify-between border rounded-lg p-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{addr.alias}</span>
                  {addr.is_default && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />Principal
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{addr.calle}, {addr.ciudad}</p>
                {addr.barrio && <p className="text-xs text-muted-foreground">{addr.barrio}</p>}
                {addr.referencia && <p className="text-xs text-muted-foreground italic">{addr.referencia}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(addr)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => deleteAddress(addr.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
