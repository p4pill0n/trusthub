-- Rename recommendations table to remediations (existing Supabase databases)
-- Chains: recommendations → remediation → remediations for older DBs

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'recommendations'
  ) THEN
    ALTER TABLE public.recommendations RENAME TO remediations;
    ALTER INDEX IF EXISTS idx_recommendations_status RENAME TO idx_remediations_status;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'remediation'
  ) THEN
    ALTER TABLE public.remediation RENAME TO remediations;
    ALTER INDEX IF EXISTS idx_remediation_status RENAME TO idx_remediations_status;
  END IF;
END $$;
