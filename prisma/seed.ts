import { PrismaClient, UserRole } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log("Seeding database...");

  // 1. store_config
  await prisma.store_config.deleteMany();
  await prisma.store_config.create({
    data: {
      store_name: "El Chimi de Juancho",
      slogan: "Creamos salsas artesanales para darle un toque único a tus comidas",
      primary_color: "#C8511B",
      secondary_color: "#F5A623",
      contact_email: "contacto@elchimidejuancho.com.py",
      contact_phone: "+595 987 260525",
      contact_whatsapp: "+595987260525",
      address: "Asunción, Paraguay",
      facebook_url: "https://facebook.com/elchimidejuancho",
      instagram_url: "https://instagram.com/elchimidejuancho",
    },
  });
  console.log("✓ store_config created");

  // 2. Admin user via Supabase Auth
  const adminEmail = "admin@artisanecommerce.com";
  const adminPassword = "Admin1234!";

  const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
  const existingAdmin = existingUser?.users?.find((u) => u.email === adminEmail);

  let adminUserId: string;

  if (existingAdmin) {
    adminUserId = existingAdmin.id;
    console.log("✓ Admin user already exists in Supabase Auth");
  } else {
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });
    if (error || !newUser.user) {
      console.error("Error creating admin:", error);
      throw error;
    }
    adminUserId = newUser.user.id;
    console.log("✓ Admin user created in Supabase Auth");
  }

  await prisma.users.upsert({
    where: { id: adminUserId },
    update: {},
    create: {
      id: adminUserId,
      email: adminEmail,
      nombre: "Admin",
      apellido: "Sistema",
      rol: UserRole.admin,
      activo: true,
    },
  });
  console.log("✓ Admin user in DB");

  // 3. Productos
  await prisma.order_items.deleteMany();
  await prisma.order_status_log.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.promotion_items.deleteMany();
  await prisma.promotions.deleteMany();
  await prisma.product_images.deleteMany();
  await prisma.products.deleteMany();

  const productos = [
    {
      nombre: "Chimichurri de Juancho",
      slug: "chimichurri-de-juancho",
      descripcion: "Nuestra receta tradicional de chimichurri, elaborada con hierbas frescas y aceite de oliva. Perfecta para carnes a la parrilla.",
      ingredientes: "Perejil fresco, ajo, orégano, ají molido, vinagre de vino, aceite de oliva, sal.",
      precio: 45000,
      stock: 50,
      activo: true,
      featured: true,
    },
    {
      nombre: "Chimichurri Picante",
      slug: "chimichurri-picante",
      descripcion: "Para los amantes del picante. Nuestra versión clásica con un toque extra de ají y pimienta cayena.",
      ingredientes: "Perejil, ajo, orégano, ají picante, pimienta cayena, vinagre, aceite de oliva, sal.",
      precio: 48000,
      stock: 35,
      activo: true,
      featured: true,
    },
    {
      nombre: "Picante Agridulce",
      slug: "picante-agridulce",
      descripcion: "La auténtica salsa criolla paraguaya, fresca y llena de sabor. Ideal para acompañar asados y empanadas.",
      ingredientes: "Tomate, cebolla, ají morrón, perejil, aceite, vinagre, sal y pimienta.",
      precio: 38000,
      stock: 40,
      activo: true,
      featured: true,
    },
    {
      nombre: "Picante de Papamon",
      slug: "picante-papamon",
      descripcion: "Una variación aromática de nuestro chimichurri clásico con romero fresco del campo.",
      ingredientes: "Perejil, romero fresco, ajo, orégano, ají molido, aceite de oliva, vinagre de manzana, sal.",
      precio: 52000,
      stock: 25,
      activo: true,
      featured: false,
    },
    {
      nombre: "Barbacoa",
      slug: "salsa-barbacoa",
      descripcion: "Nuestra exclusiva salsa negra a base de chimichurri ahumado, perfecta para marinadas y carnes a la parrilla.",
      ingredientes: "Perejil, ajo ahumado, orégano, pimienta negra, salsa soja, aceite de oliva, vinagre balsámico, sal.",
      precio: 65000,
      stock: 20,
      activo: true,
      featured: false,
    },
    {
      nombre: "Mayo de Nancy",
      slug: "mayo-nancy",
      descripcion: "Nuestra exclusiva salsa negra a base de chimichurri ahumado, perfecta para marinadas y carnes a la parrilla.",
      ingredientes: "Perejil, ajo ahumado, orégano, pimienta negra, salsa soja, aceite de oliva, vinagre balsámico, sal.",
      precio: 55000,
      stock: 20,
      activo: true,
      featured: false,
    },
  ];

  const createdProducts: { id: string; slug: string }[] = [];

  for (const prod of productos) {
    const product = await prisma.products.create({ data: prod });
    createdProducts.push({ id: product.id, slug: product.slug });

    await prisma.product_images.createMany({
      data: [
        {
          product_id: product.id,
          url: `https://placehold.co/800x600/C8511B/ffffff?text=${encodeURIComponent(prod.nombre)}`,
          alt_text: prod.nombre,
          orden: 0,
          is_primary: true,
        },
        {
          product_id: product.id,
          url: `https://placehold.co/800x600/F5A623/ffffff?text=${encodeURIComponent(prod.nombre + " 2")}`,
          alt_text: `${prod.nombre} - detalle`,
          orden: 1,
          is_primary: false,
        },
      ],
    });
  }
  console.log(`✓ ${productos.length} products created`);

  // 4. Promoción
  const promo = await prisma.promotions.create({
    data: {
      nombre: "Pack Asador Completo",
      slug: "pack-asador-completo",
      descripcion: "Todo lo que necesitás para un asado perfecto. Nuestro chimichurri clásico, el picante y la salsa criolla juntos a un precio especial.",
      precio_promocional: 115000,
      activa: true,
      imagen_url: "https://placehold.co/800x600/C8511B/ffffff?text=Pack+Asador",
    },
  });

  await prisma.promotion_items.createMany({
    data: [
      { promotion_id: promo.id, product_id: createdProducts[0].id, cantidad: 1 },
      { promotion_id: promo.id, product_id: createdProducts[1].id, cantidad: 1 },
      { promotion_id: promo.id, product_id: createdProducts[2].id, cantidad: 1 },
    ],
  });
  console.log("✓ Promotion created");

  console.log("\n✅ Seed completed successfully!\n");
  console.log("Admin credentials:");
  console.log("  Email:", adminEmail);
  console.log("  Password:", adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
