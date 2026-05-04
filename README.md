# chimi-ecommerce

Plataforma de ecommerce **multi-tenant por configuración**, production-ready. Una instalación, múltiples negocios: solo cambiás los datos en el panel admin y la tienda se adapta completamente sin tocar código.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript estricto) |
| UI | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| ORM | Prisma |
| Autenticación | Supabase Auth (email/password) |
| Storage | Supabase Storage |
| Emails | Resend + React Email |
| Estado carrito | Zustand (persistencia localStorage) |
| Formularios | React Hook Form + Zod |
| Tablas admin | TanStack Table |
| Deploy | Vercel |

---

## Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (plan gratuito alcanza)
- Cuenta en [Resend](https://resend.com) (plan gratuito alcanza para desarrollo)
- Cuenta en [Vercel](https://vercel.com) para el deploy

---

## Configuración paso a paso

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/chimi-ecommerce.git
cd chimi-ecommerce
npm install
```

### 2. Crear proyecto en Supabase

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en **New project**
3. Elegir nombre, contraseña de base de datos y región (South America recomendado)
4. Esperar que se cree (~2 minutos)

### 3. Obtener variables de entorno

**Supabase → Settings → API:**
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key
- `SUPABASE_SERVICE_ROLE_KEY` — service_role key (⚠️ nunca exponerla en el cliente)

**Supabase → Settings → Database → Connection string:**
- `DATABASE_URL` — Copiar la URI del **Transaction pooler** (puerto 6543), agregar `?pgbouncer=true` al final
- `DIRECT_URL` — Copiar la URI del **Session mode** (puerto 5432)

**Resend → API Keys:**
- `RESEND_API_KEY` — Crear una nueva key

### 4. Configurar archivo .env.local

```bash
cp .env.example .env.local
# Editar .env.local con tus valores reales
```

### 5. Aplicar el schema de base de datos

```bash
npm run db:generate    # Genera el Prisma Client
npm run db:push        # Aplica el schema a Supabase (sin migrations)
```

### 6. Ejecutar las políticas RLS

En **Supabase Dashboard → SQL Editor**, pegar y ejecutar el contenido de `supabase/rls-policies.sql`.

> ⚠️ Importante: ejecutar también las líneas de creación de storage buckets que están comentadas al final del archivo SQL.

### 7. Crear los buckets de Storage

En **Supabase → Storage → New bucket**, crear estos 4 buckets como **public**:
- `products`
- `promotions`
- `logos`
- `config`

### 8. Ejecutar el seed inicial

```bash
npm run db:seed
```

Esto crea:
- La configuración inicial de la tienda (El Chimi de Juancho)
- 1 usuario admin: `admin@artisanecommerce.com` / `Admin1234!`
- 5 productos de salsas artesanales
- 1 promoción activa (Pack Asador Completo)

### 9. Correr en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Estructura del proyecto

```
chimi-ecommerce/
├── prisma/
│   ├── schema.prisma       # Modelos de BD
│   └── seed.ts             # Datos iniciales
├── supabase/
│   └── rls-policies.sql    # Políticas de seguridad
├── src/
│   ├── app/
│   │   ├── (public)/       # Tienda pública (layout con Header/Footer)
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── productos/          # Catálogo y detalle
│   │   │   ├── promociones/        # Listado y detalle
│   │   │   ├── carrito/            # Carrito standalone
│   │   │   ├── checkout/           # Formulario de pedido
│   │   │   └── perfil/             # Cuenta del usuario
│   │   ├── admin/          # Panel de administración
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── productos/
│   │   │   ├── promociones/
│   │   │   ├── ordenes/
│   │   │   ├── usuarios/
│   │   │   └── configuracion/
│   │   ├── auth/           # Login y registro
│   │   └── api/            # API Routes (REST)
│   ├── components/
│   │   ├── ui/             # shadcn/ui primitivos
│   │   ├── layout/         # Header, Footer, AdminSidebar
│   │   ├── products/       # ProductCard, ProductGrid, ImageGallery
│   │   ├── promotions/     # PromotionCard, PromotionBanner
│   │   ├── cart/           # CartDrawer
│   │   ├── orders/         # OrderCard, OrderStatusBadge, OrderTimeline
│   │   ├── auth/           # LoginForm, RegisterForm
│   │   └── admin/          # DataTable, ProductForm, PromotionForm, etc.
│   ├── emails/             # Templates React Email
│   ├── hooks/              # useCart (Zustand), useStoreConfig, useOrders
│   └── lib/
│       ├── supabase/       # Clients (browser, server, middleware)
│       ├── validations/    # Schemas Zod
│       ├── prisma.ts
│       ├── utils.ts        # formatPYG, formatDate, generateSlug
│       └── constants.ts    # ORDER_STATUS_LABELS, ORDER_STATUS_COLORS
└── middleware.ts           # Protección de rutas
```

---

## Deploy en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. En **Settings → Environment Variables**, agregar todas las variables de `.env.local`
3. Cambiar `NEXT_PUBLIC_SITE_URL` al dominio de Vercel (ej: `https://mi-tienda.vercel.app`)
4. Hacer deploy

> El build corre `prisma generate` automáticamente gracias a `postinstall`.

Para agregar `postinstall` al `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

---

## Cómo configurar un nuevo cliente

El sistema es multi-tenant por configuración: **todo el texto visible al cliente viene de la tabla `store_config`**, no hay nada hardcodeado.

Para usar la plataforma con otra empresa:

1. Ir a `/admin/configuracion`
2. Actualizar:
   - **Nombre** de la tienda
   - **Slogan**
   - **Logo** (subir imagen)
   - **Colores** primario y secundario (hex)
   - **Datos de contacto**: email, teléfono, WhatsApp
   - **Redes sociales**: Facebook, Instagram
3. Guardar — los cambios se reflejan instantáneamente en toda la tienda

No se necesita tocar código ni hacer redeploy.

---

## Cómo agregar el primer usuario admin

### Opción A — Con seed (recomendado para fresh install)

```bash
npm run db:seed
# Usuario: admin@artisanecommerce.com / Admin1234!
```

### Opción B — Promover un usuario existente

Desde **Supabase → SQL Editor**:

```sql
UPDATE public.users
SET rol = 'admin'
WHERE email = 'tu@email.com';
```

### Opción C — Via API (requiere un admin existente)

```bash
curl -X PATCH https://tu-dominio.vercel.app/api/usuarios/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"rol": "admin"}'
```

---

## Estados de órdenes

```
pendiente_confirmacion → confirmado → pendiente_pago → pendiente_envio → enviado → entregado
                                                                                  ↘ cancelado
```

Cada cambio de estado:
- Se registra en `order_status_log` con timestamp
- Envía un email automático al cliente con React Email + Resend

---

## Variables de entorno (referencia)

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon | Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada admin | Settings → API |
| `DATABASE_URL` | Connection string pooler (6543) | Settings → Database |
| `DIRECT_URL` | Connection string directo (5432) | Settings → Database |
| `RESEND_API_KEY` | API key de Resend | resend.com/api-keys |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio | Tu dominio / localhost |
