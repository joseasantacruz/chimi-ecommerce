import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const config = await prisma.store_config.findFirst();
  return {
    title: {
      default: config?.store_name ?? "Tienda Online",
      template: `%s | ${config?.store_name ?? "Tienda Online"}`,
    },
    description: config?.slogan ?? "Tienda online de productos artesanales",
    icons: config?.logo_url
      ? { icon: config.logo_url, apple: config.logo_url }
      : undefined,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
