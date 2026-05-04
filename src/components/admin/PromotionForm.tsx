"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, X, Search, Upload } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { promotionSchema, type PromotionFormValues } from "@/lib/validations/config";
import { generateSlug, formatPYG } from "@/lib/utils";
import { toast } from "sonner";
import type { products, promotions, promotion_items, promotion_images } from "@prisma/client";

type PromotionWithItems = promotions & {
  promotion_items: (promotion_items & { product: products })[];
  promotion_images: promotion_images[];
};

interface ImagePreview {
  url: string;
  file?: File;
  id?: string;
  is_primary: boolean;
}

interface PromotionFormProps {
  promotion?: PromotionWithItems;
  products: products[];
}

export function PromotionForm({ promotion, products }: PromotionFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>(() => {
    if (promotion?.promotion_images?.length) {
      return promotion.promotion_images
        .sort((a, b) => a.orden - b.orden)
        .map((img) => ({ url: img.url, id: img.id, is_primary: img.is_primary }));
    }
    if (promotion?.imagen_url) {
      return [{ url: promotion.imagen_url, is_primary: true }];
    }
    return [];
  });
  const [productSearch, setProductSearch] = useState("");
  const router = useRouter();

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

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = form.watch("items");

  const handleNombreChange = (value: string) => {
    form.setValue("nombre", value);
    if (!promotion) form.setValue("slug", generateSlug(value));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      const objectUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, { url: objectUrl, file, is_primary: prev.length === 0 }]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const setPrimary = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  const addProduct = (product: products) => {
    if (watchedItems.some((i) => i.product_id === product.id)) {
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

  const uploadImages = async (promotionId: string) => {
    const uploadedUrls: { url: string; is_primary: boolean }[] = [];
    for (const img of images) {
      if (img.file) {
        const ext = img.file.name.split(".").pop();
        const path = `${promotionId}/${Date.now()}.${ext}`;
        const formData = new FormData();
        formData.append("file", img.file);
        formData.append("bucket", "promotions");
        formData.append("path", path);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const { url } = await res.json();
          uploadedUrls.push({ url, is_primary: img.is_primary });
        }
      } else {
        uploadedUrls.push({ url: img.url, is_primary: img.is_primary });
      }
    }
    return uploadedUrls;
  };

  const onSubmit = async (values: PromotionFormValues) => {
    setLoading(true);
    try {
      const method = promotion ? "PUT" : "POST";
      const apiUrl = promotion ? `/api/promociones/${promotion.id}` : "/api/promociones";

      const res = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, imagen_url: promotion?.imagen_url ?? "" }),
      });

      if (!res.ok) throw new Error();
      const saved = await res.json();
      const promotionId = saved.id;

      const uploadedImages = await uploadImages(promotionId);

      await fetch(`/api/promociones/${promotionId}/imagenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: uploadedImages }),
      });

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
                <FormControl><Input {...field} /></FormControl>
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
              <FormControl><Textarea rows={3} {...field} /></FormControl>
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
                <FormControl><Input type="number" min={0} step={1000} {...field} /></FormControl>
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
                <FormControl><Input type="date" {...field} /></FormControl>
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
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Imágenes */}
        <div>
          <FormLabel>Imágenes</FormLabel>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${img.is_primary ? "border-primary" : "border-transparent"}`}>
                  <Image src={img.url} alt="" fill className="object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimary(index)}
                    className="text-white text-xs bg-primary px-2 py-1 rounded"
                  >
                    Principal
                  </button>
                  <button type="button" onClick={() => removeImage(index)} className="text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {img.is_primary && (
                  <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                    Principal
                  </span>
                )}
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <div className="text-center">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1 block">Agregar</span>
              </div>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
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
                          <Input type="number" min={1} className="w-16 h-8 text-center" {...f} />
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
