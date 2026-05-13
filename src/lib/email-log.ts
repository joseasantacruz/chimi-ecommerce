import { prisma } from "@/lib/prisma";

interface LogEmailParams {
  to: string;
  subject: string;
  tipo: string;
  userId?: string;
  resendId?: string;
  error?: string;
}

export async function logEmail({ to, subject, tipo, userId, resendId, error }: LogEmailParams) {
  await prisma.email_logs.create({
    data: {
      to,
      subject,
      tipo,
      estado: error ? "error" : "enviado",
      error_msg: error ?? null,
      resend_id: resendId ?? null,
      user_id: userId ?? null,
    },
  }).catch(() => {});
}
