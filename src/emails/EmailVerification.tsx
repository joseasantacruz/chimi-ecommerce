import {
  Html, Head, Body, Container, Section, Heading, Text, Button, Hr, Preview,
} from "@react-email/components";

interface EmailVerificationProps {
  storeName: string;
  primaryColor: string;
  clientName: string;
  verificationUrl: string;
}

export function EmailVerification({ storeName, primaryColor, clientName, verificationUrl }: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verificá tu email para activar tu cuenta en {storeName}</Preview>
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
              Para activar tu cuenta en <strong>{storeName}</strong> y poder iniciar sesión, necesitás verificar tu dirección de email haciendo clic en el botón a continuación.
            </Text>

            <div style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={verificationUrl}
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
                Verificar mi email
              </Button>
            </div>

            <Text style={{ color: "#888", fontSize: "14px" }}>
              Si el botón no funciona, copiá y pegá este enlace en tu navegador:
            </Text>
            <Text style={{ color: primaryColor, fontSize: "13px", wordBreak: "break-all" }}>
              {verificationUrl}
            </Text>

            <Hr />

            <Text style={{ color: "#aaa", fontSize: "13px" }}>
              Si no creaste esta cuenta, podés ignorar este mensaje.
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
