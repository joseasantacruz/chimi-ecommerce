"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { generateSlug } from "@/lib/utils";
import { toast } from "sonner";
import type { products, product_images } from "@prisma/client";

type ProductWithImages = products & { images: product_images[] };

interface ProductFormProps {
  product?: ProductWithImages;
}

interface ImagePreview {
  url: string;
  file?: File;
  id?: string;
  is_primary: boolean;
}

export function ProductForm({ product }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>(
    product?.images.map((img) => ({ url: img.url, id: img.id, is_primary: img.is_primary })) ?? []
  );
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: product?.nombre ?? "",
      slug: product?.slug ?? "",
      descripcion: product?.descripcion ?? "",
      ingredientes: product?.ingredientes ?? "",
      precio: product ? Number(product.precio) : 0,
      stock: product?.stock ?? 0,
      activo: product?.activo ?? true,
      featured: product?.featured ?? false,
    },
  });

  const handleNombreChange = (value: string) => {
    form.setValue("nombre", value);
    if (!product) {
      form.setValue("slug", generateSlug(value));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      const objectUrl = URL.createObjectURL(file);
      setImages((prev) => [
        ...prev,
        { url: objectUrl, file, is_primary: prev.length === 0 },
      ]);
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
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    );
  };

  const uploadImages = async (productId: string) => {
    const uploadedUrls: { url: string; is_primary: boolean }[] = [];

    for (const img of images) {
      if (img.file) {
        const ext = img.file.name.split(".").pop();
        const path = `${productId}/${Date.now()}.${ext}`;
        const formData = new FormData();
        formData.append("file", img.file);
        formData.append("bucket", "products");
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

  const onSubmit = async (values: ProductFormValues) => {
    setLoading(true);
    try {
      const method = product ? "PUT" : "POST";
      const url = product ? `/api/productos/${product.id}` : "/api/productos";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Error al guardar el producto");

      const saved = await res.json();
      const productId = saved.id;

      const uploadedImages = await uploadImages(productId);

      if (uploadedImages.length > 0) {
        await fetch(`/api/productos/${productId}/imagenes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: uploadedImages }),
        });
      }

      toast.success(product ? "Producto actualizado" : "Producto creado");
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      toast.error("Error al guardar el producto");
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
                <FormLabel>Nombre del producto</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => handleNombreChange(e.target.value)}
                  />
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
                <FormLabel>Slug (URL)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Se genera automáticamente del nombre</FormDescription>
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

        <FormField
          control={form.control}
          name="ingredientes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingredientes</FormLabel>
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
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio (₲)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={1000} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-8">
          <FormField
            control={form.control}
            name="activo"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Activo</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Destacado en home</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Image upload */}
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
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-white"
                  >
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

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {product ? "Actualizar producto" : "Crear producto"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
