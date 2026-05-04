import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatPYG, formatDate } from "@/lib/utils";
import type { orders, order_items } from "@prisma/client";

type OrderWithItems = orders & { order_items: order_items[] };

interface OrderCardProps {
  order: OrderWithItems;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link href={`/perfil/pedidos/${order.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-muted-foreground">
                  #{order.id.slice(-8).toUpperCase()}
                </span>
                <OrderStatusBadge status={order.estado} />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.created_at)} · {order.order_items.length} {order.order_items.length === 1 ? "producto" : "productos"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{formatPYG(Number(order.total))}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
