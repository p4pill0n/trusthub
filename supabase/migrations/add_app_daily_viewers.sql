-- One row per browser/session viewer per calendar day (app usage)
CREATE TABLE IF NOT EXISTS public.app_daily_viewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viewed_on DATE NOT NULL DEFAULT (CURRENT_DATE),
  viewer_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (viewed_on, viewer_key)
);

CREATE INDEX IF NOT EXISTS idx_app_daily_viewers_viewed_on
  ON public.app_daily_viewers (viewed_on DESC);

ALTER TABLE public.app_daily_viewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read app_daily_viewers"
  ON public.app_daily_viewers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert app_daily_viewers"
  ON public.app_daily_viewers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Anon can read app_daily_viewers for demo"
  ON public.app_daily_viewers FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert app_daily_viewers for demo"
  ON public.app_daily_viewers FOR INSERT TO anon WITH CHECK (true);
