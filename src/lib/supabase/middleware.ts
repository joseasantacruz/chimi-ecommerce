import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Proteger rutas /perfil/* y /checkout
  const protectedUserRoutes = ["/perfil", "/checkout"];
  const isProtectedUser = protectedUserRoutes.some((r) => pathname.startsWith(r));

  // Proteger rutas /admin/*
  const isAdminRoute = pathname.startsWith("/admin");

  if ((isProtectedUser || isAdminRoute) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if ((isProtectedUser || isAdminRoute) && user) {
    const { data: userData } = await supabase
      .from("users")
      .select("rol, activo")
      .eq("id", user.id)
      .single();

    // Cuenta desactivada: forzar cierre de sesión
    if (userData?.activo === false) {
      await supabase.auth.signOut();
      const redirectUrl = new URL("/auth/login?desactivada=1", request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }

    if (isAdminRoute && userData?.rol !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}
