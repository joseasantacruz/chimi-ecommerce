import { z } from "zod";

export const productSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres").regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  descripcion: z.string().optional(),
  ingredientes: z.string().optional(),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  activo: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productSchema>;
