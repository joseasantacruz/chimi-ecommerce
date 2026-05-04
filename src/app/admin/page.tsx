import { ShoppingBag, Users, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { MetricCard } from "@/components/admin/MetricCard";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatPYG, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default async function AdminPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayOrders, pendingOrders, monthRevenue, totalClients, recentOrders] = await Promise.all([
    prisma.orders.count({ where: { created_at: { gte: today } } }),
    prisma.orders.count({ where: { estado: "pendiente_confirmacion" } }),
    prisma.orders.aggregate({
      where: { created_at: { gte: monthStart }, estado: { notIn: ["cancelado"] } },
      _sum: { total: true },
    }),
    prisma.users.count({ where: { rol: "cliente", activo: true } }),
    prisma.orders.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      include: { user: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de actividad</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Órdenes hoy"
          value={todayOrders}
          icon={ShoppingBag}
          description="Pedidos del día"
        />
        <MetricCard
          title="Pendientes"
          value={pendingOrders}
          icon={Clock}
          description="Requieren confirmación"
          className="border-yellow-200"
        />
        <MetricCard
          title="Ingresos del mes"
          value={formatPYG(Number(monthRevenue._sum.total ?? 0))}
          icon={DollarSign}
          description={`${new Date().toLocaleString("es-PY", { month: "long" })}`}
        />
        <MetricCard
          title="Clientes activos"
          value={totalClients}
          icon={Users}
          description="Clientes registrados"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Últimas órdenes</CardTitle>
            <Link href="/admin/ordenes" className="text-sm text-primary hover:underline">
              Ver todas →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={`/admin/ordenes/${order.id}`} className="font-mono text-sm hover:underline">
                      #{order.id.slice(-8).toUpperCase()}
                    </Link>
                  </TableCell>
                  <TableCell>{order.user.nombre} {order.user.apellido}</TableCell>
                  <TableCell><OrderStatusBadge status={order.estado} /></TableCell>
                  <TableCell>{formatPYG(Number(order.total))}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
