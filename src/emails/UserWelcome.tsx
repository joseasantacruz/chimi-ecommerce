import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Preview,
} from "@react-email/components";

interface UserWelcomeProps {
  storeName: string;
  primaryColor: string;
  clientName: string;
  siteUrl: string;
}

export function UserWelcome({
  storeName,
  primaryColor,
  clientName,
  siteUrl,
}: UserWelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmación de usuario — {storeName}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", margin: 0, padding: "20px 0" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
          <Section style={{ backgroundColor: primaryColor, padding: "30px", textAlign: "center" }}>
            <Heading style={{ color: "#ffffff", margin: 0, fontSize: "24px" }}>{storeName}</Heading>
          </Section>

          <Section style={{ padding: "30px" }}>
            <Heading as="h2" style={{ color: "#333", marginTop: 0 }}>
              ¡Bienvenido/a, {clientName}!
            </Heading>
            <Text style={{ color: "#555", fontSize: "16px", lineHeight: "1.6" }}>
              Tu cuenta en <strong>{storeName}</strong> ha sido creada exitosamente.
              Ya podés iniciar sesión y comenzar a explorar todos nuestros productos y promociones.
            </Text>
            <Text style={{ color: "#555", fontSize: "16px", lineHeight: "1.6" }}>
              Si recibiste un correo de confirmación con un enlace de activación, hacé clic en él
              para verificar tu dirección de email y activar completamente tu cuenta en{" "}
              <a href={siteUrl} style={{ color: primaryColor }}>{storeName}</a>.
            </Text>

            <Hr />

            <div style={{ backgroundColor: "#f8f8f8", borderRadius: "6px", padding: "16px", textAlign: "center" }}>
              <Text style={{ margin: 0, color: "#888", fontSize: "14px" }}>
                Si no creaste esta cuenta, podés ignorar este mensaje.
              </Text>
            </div>
          </Section>

          <Section style={{ backgroundColor: "#f8f8f8", padding: "20px", textAlign: "center" }}>
            <Text style={{ color: "#999", fontSize: "12px", margin: 0 }}>
              Este email fue enviado por {storeName}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
