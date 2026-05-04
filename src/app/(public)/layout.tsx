import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { hexToHslString } from "@/lib/utils";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await prisma.store_config.findFirst();
  const buttonHsl = config?.button_color ? hexToHslString(config.button_color) : null;

  return (
    <div
      className="flex flex-col min-h-screen"
      style={buttonHsl ? ({ "--primary": buttonHsl, "--ring": buttonHsl } as React.CSSProperties) : undefined}
    >
      <Header config={config} />
      <main className="flex-1">{children}</main>
      <Footer config={config} />
    </div>
  );
}
