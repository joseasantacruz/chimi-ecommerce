import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await prisma.store_config.findFirst();

  return (
    <div className="flex flex-col min-h-screen">
      <Header config={config} />
      <main className="flex-1">{children}</main>
      <Footer config={config} />
    </div>
  );
}
