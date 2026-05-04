"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPYG, formatDate } from "@/lib/utils";
import type { orders, order_items, order_status_log, addresses } from "@prisma/client";

type OrderDetail = orders & {
  order_items: order_items[];
  order_status_log: order_status_log[];
  address: addresses | null;
};

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ordenes/${params.id}`)
      .then((r) => r.json())
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="container py-12 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!order) {
    return <div className="container py-12 text-center text-muted-foreground">Pedido no encontrado.</div>;
  }

  return (
    <div className="container py-12 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.estado} />
      </div>

      <div className="grid gap-6">
        {/* Items */}
        <Card>
          <CardHeader><CardTitle>Productos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.nombre_snapshot} × {item.cantidad}</span>
                  <span className="font-medium">{formatPYG(Number(item.subtotal))}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPYG(Number(order.total))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        {order.address && (
          <Card>
            <CardHeader><CardTitle>Dirección de envío</CardTitle></CardHeader>
            <CardContent>
              <p>{order.address.calle}</p>
              <p className="text-muted-foreground">{order.address.barrio ? `${order.address.barrio}, ` : ""}{order.address.ciudad}</p>
              {order.address.referencia && <p className="text-sm text-muted-foreground">{order.address.referencia}</p>}
            </CardContent>
          </Card>
        )}

        {/* Facturación */}
        {(order.ruc_factura || order.denominacion_factura) && (
          <Card>
            <CardHeader><CardTitle>Datos de facturación</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              {order.ruc_factura && <p><span className="font-medium">RUC:</span> {order.ruc_factura}</p>}
              {order.denominacion_factura && <p><span className="font-medium">Denominación:</span> {order.denominacion_factura}</p>}
            </CardContent>
          </Card>
        )}

        {/* Notas */}
        {(order.notas_cliente || order.notas_admin) && (
          <Card>
            <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.notas_cliente && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tu nota:</p>
                  <p className="text-sm">{order.notas_cliente}</p>
                </div>
              )}
              {order.notas_admin && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Nota del equipo:</p>
                  <p className="text-sm">{order.notas_admin}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {order.order_status_log.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Historial del pedido</CardTitle></CardHeader>
            <CardContent>
              <OrderTimeline logs={order.order_status_log.slice().reverse()} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
