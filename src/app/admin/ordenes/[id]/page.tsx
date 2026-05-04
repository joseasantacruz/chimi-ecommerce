"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatPYG, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { orders, order_items, order_status_log, addresses, users } from "@prisma/client";
import type { OrderStatus } from "@prisma/client";

type OrderDetail = orders & {
  order_items: order_items[];
  order_status_log: order_status_log[];
  address: addresses | null;
  user: users;
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    fetch(`/api/ordenes/${params.id}?admin=true`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setAdminNotes(data.notas_admin ?? "");
        setNewStatus(data.estado);
      })
      .catch(console.error);
  }, [params.id]);

  const saveAdminNotes = async () => {
    setSaving(true);
    const res = await fetch(`/api/ordenes/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notas_admin: adminNotes }),
    });
    if (res.ok) toast.success("Notas guardadas");
    else toast.error("Error al guardar");
    setSaving(false);
  };

  const changeStatus = async () => {
    if (!newStatus || newStatus === order?.estado) return;
    setChangingStatus(true);
    const res = await fetch(`/api/ordenes/${params.id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: newStatus, notas: statusNotes }),
    });
    if (res.ok) {
      toast.success("Estado actualizado");
      const updated = await fetch(`/api/ordenes/${params.id}?admin=true`).then((r) => r.json());
      setOrder(updated);
      setStatusNotes("");
    } else {
      toast.error("Error al cambiar estado");
    }
    setChangingStatus(false);
  };

  if (!order) {
    return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orden #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.estado} />
      </div>

      {/* Cliente */}
      <Card>
        <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="font-medium">Nombre:</span> {order.user.nombre} {order.user.apellido}</p>
          <p><span className="font-medium">Email:</span> {order.user.email}</p>
          {order.user.telefono && <p><span className="font-medium">Teléfono:</span> {order.user.telefono}</p>}
          {order.ruc_factura && <p><span className="font-medium">RUC:</span> {order.ruc_factura}</p>}
          {order.denominacion_factura && <p><span className="font-medium">Denominación:</span> {order.denominacion_factura}</p>}
        </CardContent>
      </Card>

      {/* Dirección */}
      {order.address && (
        <Card>
          <CardHeader><CardTitle>Dirección de envío</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>{order.address.calle}</p>
            <p className="text-muted-foreground">{order.address.barrio ? `${order.address.barrio}, ` : ""}{order.address.ciudad}</p>
            {order.address.referencia && <p className="text-muted-foreground">{order.address.referencia}</p>}
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader><CardTitle>Productos</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.nombre_snapshot} × {item.cantidad}</span>
                <span>{formatPYG(Number(item.subtotal))}</span>
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

      {/* Notas cliente */}
      {order.notas_cliente && (
        <Card>
          <CardHeader><CardTitle>Notas del cliente</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{order.notas_cliente}</p></CardContent>
        </Card>
      )}

      {/* Notas admin */}
      <Card>
        <CardHeader><CardTitle>Notas internas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Notas visibles para el cliente y el equipo..."
            rows={3}
          />
          <Button size="sm" onClick={saveAdminNotes} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Guardar notas
          </Button>
        </CardContent>
      </Card>

      {/* Cambiar estado */}
      <Card>
        <CardHeader><CardTitle>Cambiar estado</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Notas para el cliente (opcional)..."
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            rows={2}
          />
          <Button
            onClick={changeStatus}
            disabled={changingStatus || newStatus === order.estado}
          >
            {changingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Cambiar estado
          </Button>
        </CardContent>
      </Card>

      {/* Timeline */}
      {order.order_status_log.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Historial de estados</CardTitle></CardHeader>
          <CardContent>
            <OrderTimeline logs={order.order_status_log.slice().reverse()} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
