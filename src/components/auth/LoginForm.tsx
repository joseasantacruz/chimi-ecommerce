"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema, type LoginFormValues } from "@/lib/validations/user";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

export function LoginForm({ contactEmail }: { contactEmail?: string | null }) {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (searchParams.get("desactivada") === "1") {
      const msg = contactEmail
        ? ` Contactá a ${contactEmail} para reactivar tu cuenta.`
        : " Contactá al administrador para reactivar tu cuenta.";
      toast.error(`Tu cuenta está desactivada.${msg}`, { duration: 8000 });
    }
  }, []);

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    // Verificación via Prisma: el uid viene del signIn, evita toda dependencia de RLS/cookies
    const checkRes = await fetch(`/api/auth/check?uid=${data.user.id}`);

    if (!checkRes.ok) {
      await supabase.auth.signOut();
      const contactMsg = contactEmail ? ` Contactá a ${contactEmail} para más información.` : " Contactá al administrador para más información.";
      toast.error(`Tu cuenta no está activa. Es posible que no hayas verificado tu email o que haya sido desactivada.${contactMsg}`, { duration: 8000 });
      setLoading(false);
      return;
    }

    const check = await checkRes.json();

    if (check?.activo === false) {
      await supabase.auth.signOut();
      const msg = contactEmail
        ? ` Contactá a ${contactEmail} para reactivar tu cuenta.`
        : " Contactá al administrador para reactivar tu cuenta.";
      toast.error(`Tu cuenta está desactivada.${msg}`, { duration: 8000 });
      setLoading(false);
      return;
    }

    if (check?.email_verificado === false) {
      await supabase.auth.signOut();
      toast.error("Debés confirmar tu email antes de iniciar sesión. Revisá tu casilla de correo.");
      setLoading(false);
      return;
    }

    toast.success("Bienvenido");
    window.location.href = redirect;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Ingresar
        </Button>
      </form>
    </Form>
  );
}
