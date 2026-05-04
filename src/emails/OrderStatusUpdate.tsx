import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Row,
  Column,
  Hr,
  Preview,
} from "@react-email/components";
import { formatPYG } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@prisma/client";

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pendiente_confirmacion: "Tu pedido está siendo revisado por nuestro equipo.",
  confirmado: "¡Tu pedido fue confirmado! Estamos preparando todo para el envío.",
  pendiente_pago: "Tu pedido está esperando el pago. Nuestro equipo se pondrá en contacto contigo.",
  pendiente_envio: "Tu pedido está listo y esperando ser enviado.",
  enviado: "¡Tu pedido ya está en camino! Pronto llegará a tu dirección.",
  entregado: "¡Tu pedido fue entregado! Esperamos que disfrutes tu compra.",
  cancelado: "Tu pedido fue cancelado. Si tenés dudas, contactanos.",
};

interface OrderStatusUpdateProps {
  storeName: string;
  primaryColor: string;
  clientName: string;
  orderId: string;
  newStatus: OrderStatus;
  notes?: string;
  items: Array<{
    nombre_snapshot: string;
    cantidad: number;
    subtotal: number;
  }>;
  total: number;
  contactWhatsapp?: string;
}

export function OrderStatusUpdate({
  storeName,
  primaryColor,
  clientName,
  orderId,
  newStatus,
  notes,
  items,
  total,
  contactWhatsapp,
}: OrderStatusUpdateProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu pedido #{orderId.slice(-8).toUpperCase()} fue actualizado — {storeName}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", margin: 0, padding: "20px 0" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
          <Section style={{ backgroundColor: primaryColor, padding: "30px", textAlign: "center" }}>
            <Heading style={{ color: "#fff", margin: 0, fontSize: "24px" }}>{storeName}</Heading>
          </Section>

          <Section style={{ padding: "30px" }}>
            <Heading as="h2" style={{ color: "#333", marginTop: 0 }}>
              Hola {clientName}, tu pedido fue actualizado
            </Heading>

            <div style={{ backgroundColor: "#f0f7ff", borderRadius: "8px", padding: "16px", marginBottom: "24px", textAlign: "center" }}>
              <Text style={{ margin: 0, fontSize: "14px", color: "#666" }}>Nuevo estado</Text>
              <Text style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: "bold", color: primaryColor }}>
                {ORDER_STATUS_LABELS[newStatus]}
              </Text>
            </div>

            <Text style={{ color: "#444" }}>{STATUS_MESSAGES[newStatus]}</Text>

            {notes && (
              <div style={{ backgroundColor: "#f8f8f8", borderRadius: "6px", padding: "12px", marginBottom: "16px" }}>
                <Text style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>Mensaje de nuestro equipo:</Text>
                <Text style={{ margin: "4px 0 0", color: "#555" }}>{notes}</Text>
              </div>
            )}

            <Heading as="h3" style={{ color: "#333" }}>Resumen de tu pedido #{orderId.slice(-8).toUpperCase()}</Heading>
            {items.map((item, index) => (
              <Row key={index} style={{ marginBottom: "8px" }}>
                <Column><Text style={{ margin: 0 }}>{item.nombre_snapshot} × {item.cantidad}</Text></Column>
                <Column style={{ textAlign: "right" }}><Text style={{ margin: 0 }}>{formatPYG(item.subtotal)}</Text></Column>
              </Row>
            ))}
            <Hr />
            <Row>
              <Column><Text style={{ fontWeight: "bold" }}>Total</Text></Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={{ fontWeight: "bold", color: primaryColor }}>{formatPYG(total)}</Text>
              </Column>
            </Row>

            {contactWhatsapp && (
              <>
                <Hr />
                <Text style={{ color: "#666", fontSize: "14px" }}>
                  ¿Tenés dudas?{" "}
                  <a href={`https://wa.me/${contactWhatsapp.replace(/\D/g, "")}`} style={{ color: primaryColor }}>
                    Contactanos por WhatsApp
                  </a>
                </Text>
              </>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
