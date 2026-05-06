import {
  Html, Head, Body, Container, Section, Heading, Text, Button, Hr, Preview,
} from "@react-email/components";

interface PasswordResetProps {
  storeName: string;
  primaryColor: string;
  clientName: string;
  resetUrl: string;
}

export function PasswordReset({ storeName, primaryColor, clientName, resetUrl }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Restablecer contraseña en {storeName}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", margin: 0, padding: "20px 0" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
          <Section style={{ backgroundColor: primaryColor, padding: "30px", textAlign: "center" }}>
            <Heading style={{ color: "#ffffff", margin: 0, fontSize: "24px" }}>{storeName}</Heading>
          </Section>

          <Section style={{ padding: "30px" }}>
            <Heading as="h2" style={{ color: "#333", marginTop: 0 }}>
              Hola, {clientName}
            </Heading>
            <Text style={{ color: "#555", fontSize: "16px", lineHeight: "1.6" }}>
              Recibiste este email porque se solicitó un restablecimiento de contraseña para tu cuenta en <strong>{storeName}</strong>.
              Hacé clic en el botón a continuación para crear una nueva contraseña.
            </Text>

            <div style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={resetUrl}
                style={{
                  backgroundColor: primaryColor,
                  color: "#ffffff",
                  padding: "14px 32px",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Restablecer contraseña
              </Button>
            </div>

            <Text style={{ color: "#888", fontSize: "14px" }}>
              Si el botón no funciona, copiá y pegá este enlace en tu navegador:
            </Text>
            <Text style={{ color: primaryColor, fontSize: "13px", wordBreak: "break-all" }}>
              {resetUrl}
            </Text>

            <Hr />

            <Text style={{ color: "#aaa", fontSize: "13px" }}>
              Si no solicitaste este cambio, podés ignorar este mensaje. Tu contraseña no será modificada.
            </Text>
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
