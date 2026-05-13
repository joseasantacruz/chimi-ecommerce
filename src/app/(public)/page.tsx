import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, ShoppingBag, Phone, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/ProductGrid";
import { PromotionBanner } from "@/components/promotions/PromotionBanner";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await prisma.store_config.findFirst();
  return {
    title: config?.store_name ?? "Tienda Online",
    description: config?.slogan ?? "Productos artesanales de calidad",
  };
}

export default async function HomePage() {
  const [config, featuredProducts, activePromotions] = await Promise.all([
    prisma.store_config.findFirst(),
    prisma.products.findMany({
      where: { activo: true, featured: true },
      include: { images: true },
      take: 8,
    }),
    prisma.promotions.findMany({
      where: {
        activa: true,
        OR: [
          { fecha_inicio: null, fecha_fin: null },
          { fecha_inicio: { lte: new Date() }, fecha_fin: { gte: new Date() } },
          { fecha_inicio: null, fecha_fin: { gte: new Date() } },
          { fecha_inicio: { lte: new Date() }, fecha_fin: null },
        ],
      },
      include: {
        promotion_items: { include: { product: true } },
      },
    }),
  ]);

  return (
    <>
      {/* Hero */}
      <section
        className="relative py-20 md:py-32 text-white text-center overflow-hidden"
        style={{ backgroundColor: config?.primary_color ?? "#C8511B" }}
      >
        {config?.hero_image_url && (
          <>
            <Image
              src={config.hero_image_url}
              alt="Hero background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}
        <div className="container relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            {config?.store_name ?? "Bienvenido"}
          </h1>
          {config?.slogan && (
            <p className="text-lg md:text-2xl opacity-90 max-w-2xl mx-auto mb-8">
              {config.slogan}
            </p>
          )}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/productos">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Ver productos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {activePromotions.length > 0 && (
              <Link href="/promociones">
                <Button
                  size="lg"
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-gray-900"
                  style={config?.secondary_color ? { borderColor: "white" } : undefined}
                >
                  Ver promociones
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Nuestros Productos</h2>
                <p className="text-muted-foreground">{config?.productos_subtitle ?? "Elaborados con ingredientes seleccionados"}</p>
              </div>
              <Link href="/productos">
                <Button variant="outline">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ProductGrid products={serialize(featuredProducts)} />
          </div>
        </section>
      )}

      {/* Promociones activas */}
      {activePromotions.length > 0 && (
        <PromotionBanner promotions={serialize(activePromotions)} subtitle={config?.promociones_subtitle} />
      )}

      {/* Cómo hacer un pedido */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">¿Cómo hacer un pedido?</h2>
            <p className="text-muted-foreground">Simple y rápido</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Package, step: "1", title: "Elegí tus productos", desc: "Explorá nuestro catálogo y agregá lo que querés al carrito" },
              { icon: ShoppingBag, step: "2", title: "Confirmá tu pedido", desc: "Revisá tu carrito e ingresá tus datos de envío y facturación" },
              { icon: Phone, step: "3", title: "Te contactamos", desc: "Nuestro equipo confirma el pedido y coordina el pago" },
              { icon: CheckCircle, step: "4", title: "Recibís tu pedido", desc: "Coordinamos la entrega o el retiro según tu preferencia" },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="flex items-center justify-center mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">PASO {step}</div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA contacto */}
      {(config?.contact_whatsapp || config?.contact_email) && (
        <section className="py-12 text-center">
          <div className="container">
            <h2 className="text-2xl font-bold mb-4">¿Tenés alguna consulta?</h2>
            <div className="flex gap-4 justify-center flex-wrap">
              {config.contact_whatsapp && (
                <a
                  href={`https://wa.me/${config.contact_whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" style={{ backgroundColor: "#25D366", color: "#fff" }}>
                    Escribinos por WhatsApp
                  </Button>
                </a>
              )}
              {config.contact_email && (
                <a href={`mailto:${config.contact_email}`}>
                  <Button size="lg" variant="outline">
                    {config.contact_email}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
