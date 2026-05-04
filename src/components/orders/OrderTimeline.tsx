import { formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { CheckCircle } from "lucide-react";
import type { order_status_log } from "@prisma/client";

interface OrderTimelineProps {
  logs: order_status_log[];
}

export function OrderTimeline({ logs }: OrderTimelineProps) {
  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={log.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-1 ${index === 0 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <CheckCircle className="h-4 w-4" />
            </div>
            {index < logs.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
          </div>
          <div className="pb-4">
            <p className="font-medium text-sm">
              {ORDER_STATUS_LABELS[log.estado_nuevo as keyof typeof ORDER_STATUS_LABELS] ?? log.estado_nuevo}
            </p>
            {log.notas && (
              <p className="text-sm text-muted-foreground mt-1">{log.notas}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateTime(log.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
