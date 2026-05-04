"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { formatPYG } from "@/lib/utils";
import { checkoutSchema, type CheckoutFormValues, addressSchema } from "@/lib/validations/order";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { addresses, users } from "@prisma/client";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<users | null>(null);
  const [addresses, setAddresses] = useState<addresses[]>([]);
  const [showNewAddress, setShowNewAddress] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address_id: "",
      save_address: false,
      ruc_factura: "",
      denominacion_factura: "",
      notas_cliente: "",
    },
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?redirect=/checkout"); return; }

      const [userRes, addrRes] = await Promise.all([
        fetch("/api/usuarios/me"),
        fetch("/api/usuarios/me/direcciones"),
      ]);

      if (userRes.ok) {
        const u = await userRes.json();
        setUserData(u);
        form.setValue("ruc_factura", u.ruc ?? "");
        form.setValue("denominacion_factura", u.denominacion ?? "");
      }

      if (addrRes.ok) {
        const addrs = await addrRes.json();
        setAddresses(addrs);
        const def = addrs.find((a: addresses) => a.is_default);
        if (def) form.setValue("address_id", def.id);
        else if (addrs.length === 0) setShowNewAddress(true);
      }
    };
    load();
  }, [supabase, router, form]);

  const grandTotal = total();

  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) { toast.error("El carrito está vacío"); return; }
    setLoading(true);

    try {
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: items.map((item) => ({
            id: item.id,
            type: item.type,
            nombre_snapshot: item.nombre,
            precio_snapshot: item.precio,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad,
          })),
          subtotal: grandTotal,
          total: grandTotal,
        }),
      });

      if (!res.ok) throw new Error("Error al crear el pedido");

      const order = await res.json();
      clearCart();
      toast.success("¡Pedido realizado! Nos contactaremos pronto.");
      router.push(`/perfil/pedidos/${order.id}`);
    } catch {
      toast.error("Error al procesar el pedido. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">No tenés items en el carrito.</p>
        <Button onClick={() => router.push("/productos")} className="mt-4">Ver productos</Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-8">Finalizar pedido</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Dirección */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Dirección de envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses.length > 0 && (
                    <FormField
                      control={form.control}
                      name="address_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup value={field.value} onValueChange={field.onChange}>
                              {addresses.map((addr) => (
                                <div key={addr.id} className="flex items-start gap-3 p-3 rounded-md border">
                                  <RadioGroupItem value={addr.id} id={addr.id} />
                                  <label htmlFor={addr.id} className="cursor-pointer">
                                    <p className="font-medium">{addr.alias}</p>
                                    <p className="text-sm text-muted-foreground">{addr.calle}, {addr.ciudad}</p>
                                    {addr.referencia && <p className="text-xs text-muted-foreground">{addr.referencia}</p>}
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewAddress(!showNewAddress)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar nueva dirección
                  </Button>

                  {showNewAddress && (
                    <div className="border rounded-md p-4 space-y-3">
                      <FormField control={form.control} name="new_address.alias" render={({ field }) => (
                        <FormItem><FormLabel>Alias (ej: Casa, Trabajo)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={form.control} name="new_address.calle" render={({ field }) => (
                          <FormItem><FormLabel>Calle y número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="new_address.ciudad" render={({ field }) => (
                          <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="new_address.barrio" render={({ field }) => (
                        <FormItem><FormLabel>Barrio (opcional)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="new_address.referencia" render={({ field }) => (
                        <FormItem><FormLabel>Referencia (opcional)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="save_address" render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel className="!mt-0 cursor-pointer">Guardar dirección en mi perfil</FormLabel>
                        </FormItem>
                      )} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Facturación */}
              <Card>
                <CardHeader>
                  <CardTitle>Datos de facturación (opcional)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="ruc_factura" render={({ field }) => (
                    <FormItem><FormLabel>RUC</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="denominacion_factura" render={({ field }) => (
                    <FormItem><FormLabel>Denominación / Razón social</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Notas */}
              <Card>
                <CardHeader><CardTitle>Notas del pedido (opcional)</CardTitle></CardHeader>
                <CardContent>
                  <FormField control={form.control} name="notas_cliente" render={({ field }) => (
                    <FormItem>
                      <FormControl><Textarea placeholder="Instrucciones especiales..." rows={3} {...field} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            {/* Resumen */}
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Resumen del pedido</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.nombre} × {item.cantidad}</span>
                      <span>{formatPYG(item.precio * item.cantidad)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPYG(grandTotal)}</span>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Realizar pedido
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Al confirmar, nuestro equipo se contactará para coordinar el pago.
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
