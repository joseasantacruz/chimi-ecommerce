import Link from "next/link";
import Image from "next/image";
import { MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verificá tu email" };

export default async function VerificacionPendientePage() {
  const config = await prisma.store_config.findFirst();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="flex flex-col items-center gap-4 mb-2">
            {config?.logo_url ? (
              <Image
                src={config.logo_url}
                alt={config.store_name}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-white font-bold text-2xl"
                style={{ backgroundColor: config?.primary_color ?? "#C8511B" }}
              >
                {config?.store_name?.[0] ?? "E"}
              </div>
            )}
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: `${config?.primary_color ?? "#C8511B"}20` }}
            >
              <MailCheck
                className="h-7 w-7"
                style={{ color: config?.primary_color ?? "#C8511B" }}
              />
            </div>
          </div>
          <CardTitle className="text-2xl">¡Revisá tu email!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Te enviamos un correo de verificación. Hacé clic en el enlace que te enviamos para activar tu cuenta en{" "}
            <strong>{config?.store_name ?? "la tienda"}</strong> antes de poder iniciar sesión.
          </p>
          <p className="text-sm text-muted-foreground">
            Si no lo encontrás, revisá tu carpeta de spam o correo no deseado.
          </p>
          <div className="pt-2">
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Ir a iniciar sesión
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
