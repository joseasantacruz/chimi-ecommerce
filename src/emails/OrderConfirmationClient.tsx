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
import { formatPYG, formatDateTime } from "@/lib/utils";

interface OrderConfirmationClientProps {
  storeName: string;
  primaryColor: string;
  clientName: string;
  orderId: string;
  orderDate: string;
  items: Array<{
    nombre_snapshot: string;
    cantidad: number;
    precio_snapshot: number;
    subtotal: number;
  }>;
  total: number;
  address?: {
    alias: string;
    calle: string;
    ciudad: string;
    barrio?: string;
    referencia?: string;
  } | null;
  contactWhatsapp?: string;
}

export function OrderConfirmationClient({
  storeName,
  primaryColor,
  clientName,
  orderId,
  orderDate,
  items,
  total,
  address,
  contactWhatsapp,
}: OrderConfirmationClientProps) {
  return (
    <Html>
      <Head />
      <Preview>Recibimos tu pedido #{orderId.slice(-8).toUpperCase()} - {storeName}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", margin: 0, padding: "20px 0" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
          {/* Header */}
          <Section style={{ backgroundColor: primaryColor, padding: "30px", textAlign: "center" }}>
            <Heading style={{ color: "#ffffff", margin: 0, fontSize: "24px" }}>{storeName}</Heading>
          </Section>

          <Section style={{ padding: "30px" }}>
            <Heading as="h2" style={{ color: "#333", marginTop: 0 }}>
              ¡Gracias por tu pedido, {clientName}!
            </Heading>
            <Text style={{ color: "#666" }}>
              Recibimos tu orden correctamente. Nuestro equipo la revisará y se contactará contigo a la brevedad para confirmar.
            </Text>

            <div style={{ backgroundColor: "#f8f8f8", borderRadius: "6px", padding: "16px", marginBottom: "24px" }}>
              <Text style={{ margin: 0, fontWeight: "bold" }}>
                Pedido #{orderId.slice(-8).toUpperCase()}
              </Text>
              <Text style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                {formatDateTime(orderDate)}
              </Text>
            </div>

            {/* Items */}
            <Heading as="h3" style={{ color: "#333", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
              Productos
            </Heading>

            {items.map((item, index) => (
              <Row key={index} style={{ marginBottom: "8px" }}>
                <Column>
                  <Text style={{ margin: 0 }}>{item.nombre_snapshot} × {item.cantidad}</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={{ margin: 0, fontWeight: "bold" }}>{formatPYG(item.subtotal)}</Text>
                </Column>
              </Row>
            ))}

            <Hr />
            <Row>
              <Column>
                <Text style={{ fontWeight: "bold", fontSize: "18px" }}>Total</Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={{ fontWeight: "bold", fontSize: "18px", color: primaryColor }}>
                  {formatPYG(total)}
                </Text>
              </Column>
            </Row>

            {/* Dirección */}
            {address && (
              <>
                <Heading as="h3" style={{ color: "#333", marginTop: "24px" }}>Dirección de envío</Heading>
                <Text style={{ margin: 0 }}>{address.calle}</Text>
                <Text style={{ margin: 0 }}>{address.barrio ? `${address.barrio}, ` : ""}{address.ciudad}</Text>
                {address.referencia && <Text style={{ margin: 0, color: "#666" }}>{address.referencia}</Text>}
              </>
            )}

            {contactWhatsapp && (
              <>
                <Hr />
                <Text style={{ color: "#666", fontSize: "14px" }}>
                  ¿Tenés dudas? Escribinos al{" "}
                  <a href={`https://wa.me/${contactWhatsapp.replace(/\D/g, "")}`} style={{ color: primaryColor }}>
                    WhatsApp: {contactWhatsapp}
                  </a>
                </Text>
              </>
            )}
          </Section>

          <Section style={{ backgroundColor: "#f8f8f8", padding: "20px", textAlign: "center" }}>
            <Text style={{ color: "#999", fontSize: "12px", margin: 0 }}>
              Este email fue enviado por {storeName}. Si no realizaste esta compra, ignorá este mensaje.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
