"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/user";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { users } from "@prisma/client";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const supabase = createClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nombre: "", apellido: "", telefono: "", ruc: "", denominacion: "" },
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");

      const res = await fetch("/api/usuarios/me");
      if (res.ok) {
        const data: users = await res.json();
        form.reset({
          nombre: data.nombre ?? "",
          apellido: data.apellido ?? "",
          telefono: data.telefono ?? "",
          ruc: data.ruc ?? "",
          denominacion: data.denominacion ?? "",
        });
      }
    };
    load();
  }, [supabase, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    const res = await fetch("/api/usuarios/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) toast.success("Perfil actualizado");
    else toast.error("Error al guardar");
    setLoading(false);
  };

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Mi Perfil</h1>

      <Card>
        <CardHeader><CardTitle>Datos personales</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="mt-1 text-sm">{email}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="apellido" render={({ field }) => (
                  <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="telefono" render={({ field }) => (
                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="ruc" render={({ field }) => (
                  <FormItem><FormLabel>RUC</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="denominacion" render={({ field }) => (
                  <FormItem><FormLabel>Denominación</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Guardar cambios
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
