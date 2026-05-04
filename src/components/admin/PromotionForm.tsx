"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { promotionSchema, type PromotionFormValues } from "@/lib/validations/config";
import { generateSlug, formatPYG } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { products, promotions, promotion_items } from "@prisma/client";

type PromotionWithItems = promotions & {
  promotion_items: (promotion_items & { product: products })[];
};

interface PromotionFormProps {
  promotion?: PromotionWithItems;
  products: products[];
}

export function PromotionForm({ promotion, products }: PromotionFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(promotion?.imagen_url ?? "");
  const [productSearch, setProductSearch] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      nombre: promotion?.nombre ?? "",
      slug: promotion?.slug ?? "",
      descripcion: promotion?.descripcion ?? "",
      precio_promocional: promotion ? Number(promotion.precio_promocional) : 0,
      activa: promotion?.activa ?? true,
      fecha_inicio: promotion?.fecha_inicio?.toISOString().slice(0, 10) ?? "",
      fecha_fin: promotion?.fecha_fin?.toISOString().slice(0, 10) ?? "",
      items: promotion?.promotion_items.map((pi) => ({
        product_id: pi.product_id,
        cantidad: pi.cantidad,
      })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  const handleNombreChange = (value: string) => {
    form.setValue("nombre", value);
    if (!promotion) form.setValue("slug", generateSlug(value));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addProduct = (product: products) => {
    const alreadyAdded = watchedItems.some((i) => i.product_id === product.id);
    if (alreadyAdded) {
      toast.info("Este producto ya está en la promoción");
      return;
    }
    append({ product_id: product.id, cantidad: 1 });
    setProductSearch("");
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(productSearch.toLowerCase()) &&
      !watchedItems.some((i) => i.product_id === p.id)
  );

  const onSubmit = async (values: PromotionFormValues) => {
    setLoading(true);
    try {
      let imagen_url = promotion?.imagen_url ?? "";

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from("promotions")
          .upload(path, imageFile, { upsert: true });
        if (!error) {
          const { data } = supabase.storage.from("promotions").getPublicUrl(path);
          imagen_url = data.publicUrl;
        }
      }

      const method = promotion ? "PUT" : "POST";
      const url = promotion ? `/api/promociones/${promotion.id}` : "/api/promociones";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, imagen_url }),
      });

      if (!res.ok) throw new Error("Error al guardar la promoción");

      toast.success(promotion ? "Promoción actualizada" : "Promoción creada");
      router.push("/admin/promociones");
      router.refresh();
    } catch {
      toast.error("Error al guardar la promoción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} onChange={(e) => handleNombreChange(e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="precio_promocional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio promocional (₲)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={1000} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="activa"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 pt-7">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Activa</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fecha_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha inicio (opcional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fecha_fin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha fin (opcional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Imagen */}
        <div>
          <FormLabel>Imagen</FormLabel>
          <div className="mt-2 flex gap-4 items-start">
            {imagePreview && (
              <div className="relative w-32 h-20 rounded overflow-hidden">
                <Image src={imagePreview} alt="" fill className="object-cover" />
              </div>
            )}
            <label className="cursor-pointer">
              <Button type="button" variant="outline" asChild>
                <span>Seleccionar imagen</span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* Productos */}
        <div>
          <FormLabel>Productos incluidos</FormLabel>
          <FormDescription>Buscá y agregá los productos de esta promoción</FormDescription>

          <div className="mt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9"
            />
            {productSearch && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border bg-background shadow-lg">
                {filteredProducts.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent"
                  >
                    <span>{p.nombre}</span>
                    <span className="text-muted-foreground">{formatPYG(Number(p.precio))}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {fields.map((field, index) => {
              const prod = products.find((p) => p.id === field.product_id);
              return (
                <div key={field.id} className="flex items-center gap-3 p-3 rounded-md border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{prod?.nombre ?? "Producto eliminado"}</p>
                    {prod && <p className="text-xs text-muted-foreground">{formatPYG(Number(prod.precio))}</p>}
                  </div>
                  <FormField
                    control={form.control}
                    name={`items.${index}.cantidad`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            className="w-16 h-8 text-center"
                            {...f}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {form.formState.errors.items && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.items.message ?? "Agregá al menos un producto"}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {promotion ? "Actualizar" : "Crear promoción"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
