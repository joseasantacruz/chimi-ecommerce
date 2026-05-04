import { z } from "zod";

export const storeConfigSchema = z.object({
  store_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slogan: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ingresá un color hex válido"),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ingresá un color hex válido"),
  button_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ingresá un color hex válido"),
  contact_email: z.string().email("Email inválido").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  contact_whatsapp: z.string().optional(),
  address: z.string().optional(),
  facebook_url: z.string().url("URL inválida").optional().or(z.literal("")),
  instagram_url: z.string().url("URL inválida").optional().or(z.literal("")),
  hero_image_url: z.string().optional(),
  productos_subtitle: z.string().optional(),
  promociones_subtitle: z.string().optional(),
});

export type StoreConfigFormValues = z.infer<typeof storeConfigSchema>;

export const promotionSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres").regex(/^[a-z0-9-]+$/),
  descripcion: z.string().optional(),
  precio_promocional: z.coerce.number().min(0, "El precio no puede ser negativo"),
  activa: z.boolean().default(true),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.string(),
      cantidad: z.coerce.number().int().min(1),
    })
  ).min(1, "Agregá al menos un producto"),
});

export type PromotionFormValues = z.infer<typeof promotionSchema>;
