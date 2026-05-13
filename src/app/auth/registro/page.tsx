import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  const config = await prisma.store_config.findFirst();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 relative">
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Link href="/">
              {config?.logo_url ? (
                <Image
                  src={config.logo_url}
                  alt={config.store_name}
                  width={72}
                  height={72}
                  className="rounded-full object-cover hover:opacity-80 transition-opacity"
                />
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-white font-bold text-2xl hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: config?.primary_color ?? "#C8511B" }}
                >
                  {config?.store_name?.[0] ?? "E"}
                </div>
              )}
            </Link>
          </div>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>Registrate en {config?.store_name ?? "la tienda"} para hacer tus pedidos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense>
            <RegisterForm />
          </Suspense>
          <div className="text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Iniciá sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
