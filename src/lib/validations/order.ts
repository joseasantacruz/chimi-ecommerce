import { z } from "zod";

export const addressSchema = z.object({
  alias: z.string().min(1, "Ingresá un alias para esta dirección"),
  calle: z.string().min(3, "Ingresá la calle y número"),
  ciudad: z.string().min(2, "Ingresá la ciudad"),
  barrio: z.string().optional(),
  referencia: z.string().optional(),
  is_default: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  address_id: z.string().optional(),
  new_address: addressSchema.optional(),
  save_address: z.boolean().default(false),
  ruc_factura: z.string().optional(),
  denominacion_factura: z.string().optional(),
  notas_cliente: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const statusUpdateSchema = z.object({
  estado: z.enum([
    "pendiente_confirmacion",
    "confirmado",
    "pendiente_pago",
    "pendiente_envio",
    "enviado",
    "entregado",
    "cancelado",
  ]),
  notas: z.string().optional(),
});

export type StatusUpdateValues = z.infer<typeof statusUpdateSchema>;
