"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { addressSchema, type AddressFormValues } from "@/lib/validations/order";
import { toast } from "sonner";
import type { addresses } from "@prisma/client";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<addresses[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { alias: "", calle: "", ciudad: "", barrio: "", referencia: "", is_default: false },
  });

  const load = async () => {
    const res = await fetch("/api/usuarios/me/direcciones");
    if (res.ok) setAddresses(await res.json());
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (values: AddressFormValues) => {
    setLoading(true);
    const res = await fetch("/api/usuarios/me/direcciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      toast.success("Dirección guardada");
      form.reset();
      setShowForm(false);
      load();
    } else {
      toast.error("Error al guardar");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/usuarios/me/direcciones/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Dirección eliminada"); load(); }
    else toast.error("Error al eliminar");
  };

  const handleSetDefault = async (id: string) => {
    const res = await fetch(`/api/usuarios/me/direcciones/${id}/default`, { method: "PUT" });
    if (res.ok) { toast.success("Dirección predeterminada actualizada"); load(); }
  };

  return (
    <div className="container py-12 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Mis Direcciones</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="alias" render={({ field }) => (
                  <FormItem><FormLabel>Alias</FormLabel><FormControl><Input placeholder="Casa, Trabajo..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="calle" render={({ field }) => (
                    <FormItem><FormLabel>Calle y número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="ciudad" render={({ field }) => (
                    <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="barrio" render={({ field }) => (
                  <FormItem><FormLabel>Barrio (opcional)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="referencia" render={({ field }) => (
                  <FormItem><FormLabel>Referencia (opcional)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>Guardar</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-4" />
          <p>No tenés direcciones guardadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{addr.alias}</p>
                    {addr.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Predeterminada</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.calle}</p>
                  <p className="text-sm text-muted-foreground">{addr.barrio ? `${addr.barrio}, ` : ""}{addr.ciudad}</p>
                  {addr.referencia && <p className="text-xs text-muted-foreground">{addr.referencia}</p>}
                </div>
                <div className="flex gap-2">
                  {!addr.is_default && (
                    <Button variant="ghost" size="icon" title="Marcar como predeterminada" onClick={() => handleSetDefault(addr.id)}>
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(addr.id)} className="bg-destructive hover:bg-destructive/90">
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
