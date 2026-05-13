"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function ConfirmarEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");

  useEffect(() => {
    if (!token) { setEstado("error"); return; }

    fetch(`/api/auth/confirmar-email?token=${token}`)
      .then((r) => r.json())
      .then((data) => setEstado(data.ok ? "ok" : "error"))
      .catch(() => setEstado("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">
            {estado === "cargando" && <Loader2 className="h-14 w-14 animate-spin text-muted-foreground" />}
            {estado === "ok" && <CheckCircle2 className="h-14 w-14 text-green-500" />}
            {estado === "error" && <XCircle className="h-14 w-14 text-red-500" />}
          </div>
          <CardTitle className="text-2xl">
            {estado === "cargando" && "Verificando..."}
            {estado === "ok" && "¡Email verificado!"}
            {estado === "error" && "Enlace inválido"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {estado === "ok" && (
            <>
              <p className="text-muted-foreground">
                Tu cuenta está activa. Ya podés iniciar sesión.
              </p>
              <Link href="/auth/login">
                <Button className="w-full">Ir a iniciar sesión</Button>
              </Link>
            </>
          )}
          {estado === "error" && (
            <>
              <p className="text-muted-foreground">
                El enlace de verificación es inválido o ya fue utilizado. Si necesitás uno nuevo, solicitalo al administrador.
              </p>
              <Link href="/">
                <Button variant="outline" className="w-full">Volver al inicio</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense>
      <ConfirmarEmailContent />
    </Suspense>
  );
}
