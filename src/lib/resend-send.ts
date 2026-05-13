import { Resend } from "resend";

interface SendParams {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

interface SendResult {
  id: string | undefined;
  fromUsed: string;
}

const FALLBACK_FROM_ADDRESS = "onboarding@resend.dev";

function buildFallbackFrom(storeName: string): string {
  return `${storeName} <${FALLBACK_FROM_ADDRESS}>`;
}

function isDomainError(msg: string): boolean {
  return msg.includes("Domain not verified") || msg.includes("not verified") || msg.includes("Invalid from address");
}

export async function sendEmail(params: SendParams, storeName: string): Promise<SendResult> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send(params);

  if (!error) {
    return { id: data?.id, fromUsed: params.from };
  }

  // Si el dominio no está verificado en Resend, reintenta con onboarding@resend.dev
  if (isDomainError(error.message ?? "")) {
    const fallbackFrom = buildFallbackFrom(storeName);
    const { data: fallbackData, error: fallbackError } = await resend.emails.send({
      ...params,
      from: fallbackFrom,
    });

    if (fallbackError) {
      throw new Error(fallbackError.message ?? "Error al enviar email");
    }

    return { id: fallbackData?.id, fromUsed: fallbackFrom };
  }

  throw new Error(error.message ?? "Error al enviar email");
}
