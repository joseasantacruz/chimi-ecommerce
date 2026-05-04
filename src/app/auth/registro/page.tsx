import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  const config = await prisma.store_config.findFirst();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
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
