"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { storeConfigSchema, type StoreConfigFormValues } from "@/lib/validations/config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { store_config } from "@prisma/client";

interface StoreConfigFormProps {
  config: store_config;
}

export function StoreConfigForm({ config }: StoreConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(config.logo_url ?? "");
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState(config.hero_image_url ?? "");
  const [heroClear, setHeroClear] = useState(false);
  const router = useRouter();

  const form = useForm<StoreConfigFormValues>({
    resolver: zodResolver(storeConfigSchema),
    defaultValues: {
      store_name: config.store_name,
      slogan: config.slogan ?? "",
      primary_color: config.primary_color,
      secondary_color: config.secondary_color,
      button_color: config.button_color,
      contact_email: config.contact_email ?? "",
      contact_phone: config.contact_phone ?? "",
      contact_whatsapp: config.contact_whatsapp ?? "",
      address: config.address ?? "",
      facebook_url: config.facebook_url ?? "",
      instagram_url: config.instagram_url ?? "",
      hero_image_url: config.hero_image_url ?? "",
      productos_subtitle: config.productos_subtitle ?? "",
      promociones_subtitle: config.promociones_subtitle ?? "",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: StoreConfigFormValues) => {
    setLoading(true);
    try {
      let logo_url = config.logo_url;

      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("bucket", "logos");
        formData.append("path", `logo.${ext}`);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          logo_url = url;
        }
      }

      let hero_image_url = heroClear ? null : config.hero_image_url;
      if (heroFile) {
        const ext = heroFile.name.split(".").pop();
        const formData = new FormData();
        formData.append("file", heroFile);
        formData.append("bucket", "logos");
        formData.append("path", `hero.${ext}`);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          hero_image_url = url;
        }
      }

      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, logo_url, hero_image_url }),
      });

      if (!res.ok) throw new Error();

      toast.success("Configuración guardada");
      router.refresh();
    } catch {
      toast.error("Error al guardar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const watchColors = form.watch(["primary_color", "secondary_color"]);
  const primaryColor = watchColors[0] ?? config.primary_color;
  const secondaryColor = watchColors[1] ?? config.secondary_color;

  return (
    <div className="space-y-8">
      {/* Preview del header */}
      <div
        className="rounded-lg p-4 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoPreview && (
              <Image src={logoPreview} alt="logo" width={40} height={40} className="rounded-full" />
            )}
            <div>
              <p className="font-bold">{form.watch("store_name") || "Nombre de la tienda"}</p>
              <p className="text-xs opacity-80">{form.watch("slogan") || "Slogan de la tienda"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-sm px-3 py-1 rounded bg-white text-gray-900 font-medium">Ver productos</span>
            <span
              className="text-sm px-3 py-1 rounded border-2 border-white font-medium"
              style={{ color: "white" }}
            >
              Ver promociones
            </span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Logo */}
          <div>
            <FormLabel>Logo</FormLabel>
            <div className="mt-2 flex gap-4 items-center">
              {logoPreview && (
                <Image src={logoPreview} alt="logo" width={64} height={64} className="rounded-full object-cover border" />
              )}
              <label className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>Cambiar logo</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
          </div>

          {/* Imagen hero */}
          <div>
            <FormLabel>Imagen de fondo del hero</FormLabel>
            <p className="text-sm text-muted-foreground mb-2">Si se sube una imagen se usa como fondo del banner principal. Si no, se usa el color primario.</p>
            <div className="mt-2 flex gap-4 items-center flex-wrap">
              {heroPreview && (
                <div className="relative w-48 h-24 rounded overflow-hidden border">
                  <Image src={heroPreview} alt="hero preview" fill className="object-cover" />
                </div>
              )}
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>{heroPreview ? "Cambiar imagen" : "Seleccionar imagen"}</span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleHeroChange} />
                </label>
                {heroPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setHeroFile(null); setHeroPreview(""); setHeroClear(true); }}
                  >
                    Quitar imagen
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="store_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la tienda</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slogan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slogan</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="primary_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color primario</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <input type="color" {...field} className="h-10 w-12 rounded border cursor-pointer" />
                      <Input {...field} placeholder="#C8511B" />
                    </div>
                  </FormControl>
                  <FormDescription>Hero, header, logo e insignias</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondary_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color secundario</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <input type="color" {...field} className="h-10 w-12 rounded border cursor-pointer" />
                      <Input {...field} placeholder="#F5A623" />
                    </div>
                  </FormControl>
                  <FormDescription>Acentos y highlights</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="button_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color de botones</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <input type="color" {...field} className="h-10 w-12 rounded border cursor-pointer" />
                      <Input {...field} placeholder="#C8511B" />
                    </div>
                  </FormControl>
                  <FormDescription>Fondo de todos los botones principales</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Datos de contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="contact_email" render={({ field }) => (
                <FormItem><FormLabel>Email de contacto</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contact_phone" render={({ field }) => (
                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contact_whatsapp" render={({ field }) => (
                <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Redes sociales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="facebook_url" render={({ field }) => (
                <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="instagram_url" render={({ field }) => (
                <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Textos de páginas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="productos_subtitle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtítulo de Productos</FormLabel>
                  <FormControl><Input placeholder="Elaborados con ingredientes frescos y naturales" {...field} /></FormControl>
                  <FormDescription>Texto bajo el título en /productos</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="promociones_subtitle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtítulo de Promociones</FormLabel>
                  <FormControl><Input placeholder="Packs especiales con descuentos exclusivos" {...field} /></FormControl>
                  <FormDescription>Texto bajo el título en /promociones</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Guardar configuración
          </Button>
        </form>
      </Form>
    </div>
  );
}
