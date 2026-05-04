import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const config = await prisma.store_config.findFirst();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{config?.store_name ?? "Tienda"}</CardTitle>
          <CardDescription>Ingresá con tu cuenta para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense>
            <LoginForm />
          </Suspense>
          <div className="text-center text-sm text-muted-foreground">
            ¿No tenés cuenta?{" "}
            <Link href="/auth/registro" className="text-primary hover:underline font-medium">
              Registrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
