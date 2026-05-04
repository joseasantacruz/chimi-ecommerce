import { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente_confirmacion: "Pendiente de Confirmación",
  confirmado: "Confirmado",
  pendiente_pago: "Pendiente de Pago",
  pendiente_envio: "Pendiente de Envío",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente_confirmacion: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  pendiente_pago: "bg-orange-100 text-orange-800",
  pendiente_envio: "bg-purple-100 text-purple-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export const ORDER_STATUS_LIST = Object.values(OrderStatus);

export const SUPABASE_BUCKETS = {
  products: "products",
  promotions: "promotions",
  logos: "logos",
  config: "config",
} as const;

export const ITEMS_PER_PAGE = 20;
