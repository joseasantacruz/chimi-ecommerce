-- ============================================================
-- RLS POLICIES — chimi-ecommerce
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Helper function: obtener el rol del usuario actual desde la tabla users
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT rol FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- store_config
-- ============================================================
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_config_public_read"
  ON public.store_config FOR SELECT
  USING (true);

CREATE POLICY "store_config_admin_write"
  ON public.store_config FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- ============================================================
-- users
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_read"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR public.get_user_role() = 'admin');

CREATE POLICY "users_own_update"
  ON public.users FOR UPDATE
  USING (id = auth.uid() OR public.get_user_role() = 'admin')
  WITH CHECK (id = auth.uid() OR public.get_user_role() = 'admin');

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid() OR public.get_user_role() = 'admin');

-- ============================================================
-- addresses
-- ============================================================
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addresses_own_select"
  ON public.addresses FOR SELECT
  USING (user_id = auth.uid() OR public.get_user_role() = 'admin');

CREATE POLICY "addresses_own_insert"
  ON public.addresses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "addresses_own_update"
  ON public.addresses FOR UPDATE
  USING (user_id = auth.uid() OR public.get_user_role() = 'admin')
  WITH CHECK (user_id = auth.uid() OR public.get_user_role() = 'admin');

CREATE POLICY "addresses_own_delete"
  ON public.addresses FOR DELETE
  USING (user_id = auth.uid() OR public.get_user_role() = 'admin');

-- ============================================================
-- products
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  USING (activo = true OR public.get_user_role() = 'admin');

CREATE POLICY "products_admin_write"
  ON public.products FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- ============================================================
-- product_images
-- ============================================================
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_images_public_read"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "product_images_admin_write"
  ON public.product_images FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- ============================================================
-- promotions
-- ============================================================
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotions_public_read"
  ON public.promotions FOR SELECT
  USING (activa = true OR public.get_user_role() = 'admin');

CREATE POLICY "promotions_admin_write"
  ON public.promotions FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- ============================================================
-- promotion_items
-- ============================================================
ALTER TABLE public.promotion_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotion_items_public_read"
  ON public.promotion_items FOR SELECT
  USING (true);

CREATE POLICY "promotion_items_admin_write"
  ON public.promotion_items FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- ============================================================
-- orders
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_own_select"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid() OR public.get_user_role() = 'admin');

CREATE POLICY "orders_own_insert"
  ON public.orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_admin_update"
  ON public.orders FOR UPDATE
  USING (public.get_user_role() = 'admin' OR user_id = auth.uid())
  WITH CHECK (public.get_user_role() = 'admin' OR user_id = auth.uid());

-- ============================================================
-- order_items
-- ============================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_own_select"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.get_user_role() = 'admin')
    )
  );

CREATE POLICY "order_items_insert_system"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

-- ============================================================
-- order_status_log
-- ============================================================
ALTER TABLE public.order_status_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_status_log_read"
  ON public.order_status_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_log.order_id
        AND (o.user_id = auth.uid() OR public.get_user_role() = 'admin')
    )
  );

CREATE POLICY "order_status_log_insert_system"
  ON public.order_status_log FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_log.order_id AND o.user_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE BUCKETS (ejecutar por separado si es necesario)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('promotions', 'promotions', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('config', 'config', true);

-- Storage policies
CREATE POLICY "storage_products_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('products', 'promotions', 'logos', 'config'));

CREATE POLICY "storage_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('products', 'promotions', 'logos', 'config')
    AND public.get_user_role() = 'admin');

CREATE POLICY "storage_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id IN ('products', 'promotions', 'logos', 'config')
    AND public.get_user_role() = 'admin');

CREATE POLICY "storage_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('products', 'promotions', 'logos', 'config')
    AND public.get_user_role() = 'admin');
