import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import type { store_config } from "@prisma/client";

interface FooterProps {
  config: store_config | null;
}

export function Footer({ config }: FooterProps) {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3
              className="font-bold text-lg mb-3"
              style={{ color: config?.primary_color ?? "#C8511B" }}
            >
              {config?.store_name ?? "Tienda"}
            </h3>
            {config?.slogan && (
              <p className="text-sm text-muted-foreground">{config.slogan}</p>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-3">Navegación</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/productos" className="hover:text-foreground transition-colors">Productos</Link></li>
              <li><Link href="/promociones" className="hover:text-foreground transition-colors">Promociones</Link></li>
              <li><Link href="/carrito" className="hover:text-foreground transition-colors">Carrito</Link></li>
              <li><Link href="/perfil" className="hover:text-foreground transition-colors">Mi Cuenta</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {config?.contact_email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${config.contact_email}`} className="hover:text-foreground transition-colors">
                    {config.contact_email}
                  </a>
                </li>
              )}
              {config?.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{config.contact_phone}</span>
                </li>
              )}
              {config?.contact_whatsapp && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a
                    href={`https://wa.me/${config.contact_whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    WhatsApp: {config.contact_whatsapp}
                  </a>
                </li>
              )}
              {config?.address && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{config.address}</span>
                </li>
              )}
            </ul>

            {(config?.facebook_url || config?.instagram_url) && (
              <div className="flex items-center gap-3 mt-4">
                {config.facebook_url && (
                  <a
                    href={config.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-blue-600 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {config.instagram_url && (
                  <a
                    href={config.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-pink-600 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {config?.store_name ?? "Tienda"}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
