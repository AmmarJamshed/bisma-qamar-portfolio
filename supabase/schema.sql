-- Bisma Qamar portfolio CMS (single-row JSON, one admin user)
-- Run in Supabase Dashboard → SQL Editor → New query → Run

CREATE TABLE IF NOT EXISTS public.portfolio_content (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_email text NOT NULL DEFAULT 'bismaqamar@portfolio.admin'
);

INSERT INTO public.site_config (id, admin_email)
VALUES (1, 'bismaqamar@portfolio.admin')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.portfolio_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read portfolio content" ON public.portfolio_content;
CREATE POLICY "Anyone can read portfolio content"
  ON public.portfolio_content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can update portfolio content" ON public.portfolio_content;
CREATE POLICY "Admin can update portfolio content"
  ON public.portfolio_content FOR UPDATE
  USING (
    (auth.jwt() ->> 'email') = (SELECT admin_email FROM public.site_config WHERE id = 1)
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = (SELECT admin_email FROM public.site_config WHERE id = 1)
  );

DROP POLICY IF EXISTS "Admin can insert portfolio content" ON public.portfolio_content;
CREATE POLICY "Admin can insert portfolio content"
  ON public.portfolio_content FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'email') = (SELECT admin_email FROM public.site_config WHERE id = 1)
  );

DROP POLICY IF EXISTS "Admin can read site config" ON public.site_config;
CREATE POLICY "Admin can read site config"
  ON public.site_config FOR SELECT
  USING (
    (auth.jwt() ->> 'email') = admin_email
  );

-- Profile photo bucket (optional uploads from admin)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-photos',
  'portfolio-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read portfolio photos" ON storage.objects;
CREATE POLICY "Public read portfolio photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-photos');

DROP POLICY IF EXISTS "Admin upload portfolio photos" ON storage.objects;
CREATE POLICY "Admin upload portfolio photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio-photos'
    AND (auth.jwt() ->> 'email') = (SELECT admin_email FROM public.site_config WHERE id = 1)
  );

DROP POLICY IF EXISTS "Admin update portfolio photos" ON storage.objects;
CREATE POLICY "Admin update portfolio photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolio-photos'
    AND (auth.jwt() ->> 'email') = (SELECT admin_email FROM public.site_config WHERE id = 1)
  );

DROP POLICY IF EXISTS "Admin delete portfolio photos" ON storage.objects;
CREATE POLICY "Admin delete portfolio photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio-photos'
    AND (auth.jwt() ->> 'email') = (SELECT admin_email FROM public.site_config WHERE id = 1)
  );
