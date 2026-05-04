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
  Button,
} from "@react-email/components";
import { formatPYG, formatDateTime } from "@/lib/utils";

interface OrderConfirmationAdminProps {
  storeName: string;
  primaryColor: string;
  orderId: string;
  orderDate: string;
  client: {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
  items: Array<{
    nombre_snapshot: string;
    cantidad: number;
    precio_snapshot: number;
    subtotal: number;
  }>;
  total: number;
  address?: {
    calle: string;
    ciudad: string;
    barrio?: string;
    referencia?: string;
  } | null;
  ruc?: string;
  denominacion?: string;
  notasCliente?: string;
  siteUrl: string;
}

export function OrderConfirmationAdmin({
  storeName,
  primaryColor,
  orderId,
  orderDate,
  client,
  items,
  total,
  address,
  ruc,
  denominacion,
  notasCliente,
  siteUrl,
}: OrderConfirmationAdminProps) {
  return (
    <Html>
      <Head />
      <Preview>Nueva orden #{orderId.slice(-8).toUpperCase()} de {client.nombre} {client.apellido}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", margin: 0, padding: "20px 0" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
          <Section style={{ backgroundColor: primaryColor, padding: "20px" }}>
            <Heading style={{ color: "#fff", margin: 0, fontSize: "18px" }}>
              Nueva orden recibida — {storeName}
            </Heading>
          </Section>

          <Section style={{ padding: "24px" }}>
            <Heading as="h2" style={{ marginTop: 0 }}>
              Orden #{orderId.slice(-8).toUpperCase()}
            </Heading>
            <Text style={{ color: "#666", marginTop: "-12px" }}>{formatDateTime(orderDate)}</Text>

            <Button
              href={`${siteUrl}/admin/ordenes/${orderId}`}
              style={{ backgroundColor: primaryColor, color: "#fff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none" }}
            >
              Ver orden en el panel →
            </Button>

            <Heading as="h3" style={{ marginTop: "24px" }}>Datos del cliente</Heading>
            <Text style={{ margin: "4px 0" }}><strong>Nombre:</strong> {client.nombre} {client.apellido}</Text>
            <Text style={{ margin: "4px 0" }}><strong>Email:</strong> {client.email}</Text>
            {client.telefono && <Text style={{ margin: "4px 0" }}><strong>Teléfono:</strong> {client.telefono}</Text>}
            {ruc && <Text style={{ margin: "4px 0" }}><strong>RUC:</strong> {ruc}</Text>}
            {denominacion && <Text style={{ margin: "4px 0" }}><strong>Denominación:</strong> {denominacion}</Text>}

            {address && (
              <>
                <Heading as="h3">Dirección de envío</Heading>
                <Text style={{ margin: "4px 0" }}>{address.calle}</Text>
                <Text style={{ margin: "4px 0" }}>{address.barrio ? `${address.barrio}, ` : ""}{address.ciudad}</Text>
                {address.referencia && <Text style={{ margin: "4px 0", color: "#666" }}>Ref: {address.referencia}</Text>}
              </>
            )}

            <Heading as="h3">Productos</Heading>
            {items.map((item, index) => (
              <Row key={index} style={{ marginBottom: "8px" }}>
                <Column><Text style={{ margin: 0 }}>{item.nombre_snapshot} × {item.cantidad}</Text></Column>
                <Column style={{ textAlign: "right" }}><Text style={{ margin: 0, fontWeight: "bold" }}>{formatPYG(item.subtotal)}</Text></Column>
              </Row>
            ))}
            <Hr />
            <Row>
              <Column><Text style={{ fontWeight: "bold", fontSize: "16px" }}>Total</Text></Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={{ fontWeight: "bold", fontSize: "16px" }}>{formatPYG(total)}</Text>
              </Column>
            </Row>

            {notasCliente && (
              <>
                <Heading as="h3">Notas del cliente</Heading>
                <Text style={{ backgroundColor: "#f8f8f8", padding: "12px", borderRadius: "6px" }}>
                  {notasCliente}
                </Text>
              </>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
