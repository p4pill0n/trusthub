-- Trust Hub: one-shot migration for existing Supabase databases
-- Run entire file in Supabase SQL Editor (Run)

-- =============================================================================
-- 1. Drop ALL check constraints on vendors (required before changing values)
-- =============================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.vendors'::regclass
      AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.vendors DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- Optional column from earlier attempt
ALTER TABLE public.vendors DROP COLUMN IF EXISTS country;

-- =============================================================================
-- 2. Update vendor data
-- =============================================================================

-- Regions (entity_name)
UPDATE public.vendors SET entity_name = 'UK'         WHERE id = 'a1000001-0000-4000-8000-000000000001';
UPDATE public.vendors SET entity_name = 'France'     WHERE id = 'a1000001-0000-4000-8000-000000000002';
UPDATE public.vendors SET entity_name = 'UK'           WHERE id = 'a1000001-0000-4000-8000-000000000003';
UPDATE public.vendors SET entity_name = 'AMER'        WHERE id = 'a1000001-0000-4000-8000-000000000004';
UPDATE public.vendors SET entity_name = 'AMER'        WHERE id = 'a1000001-0000-4000-8000-000000000005';
UPDATE public.vendors SET entity_name = 'France'     WHERE id = 'a1000001-0000-4000-8000-000000000006';
UPDATE public.vendors SET entity_name = 'AMER'        WHERE id = 'a1000001-0000-4000-8000-000000000007';
UPDATE public.vendors SET entity_name = 'ASIA'        WHERE id = 'a1000001-0000-4000-8000-000000000008';
UPDATE public.vendors SET entity_name = 'AMER'        WHERE id = 'a1000001-0000-4000-8000-000000000009';
UPDATE public.vendors SET entity_name = 'UK'           WHERE id = 'a1000001-0000-4000-8000-00000000000a';
UPDATE public.vendors SET entity_name = 'France'     WHERE id = 'a1000001-0000-4000-8000-00000000000b';
UPDATE public.vendors SET entity_name = 'AMER'        WHERE id = 'a1000001-0000-4000-8000-00000000000c';
UPDATE public.vendors SET entity_name = 'France'     WHERE id = 'a1000001-0000-4000-8000-00000000000d';
UPDATE public.vendors SET entity_name = 'AMER'        WHERE id = 'a1000001-0000-4000-8000-00000000000e';
UPDATE public.vendors SET entity_name = 'AMER'        WHERE id = 'a1000001-0000-4000-8000-00000000000f';
UPDATE public.vendors SET entity_name = 'UK'           WHERE id = 'a1000001-0000-4000-8000-000000000010';
UPDATE public.vendors SET entity_name = 'UK'           WHERE id = 'a1000001-0000-4000-8000-000000000011';
UPDATE public.vendors SET entity_name = 'AMER'        WHERE id = 'a1000001-0000-4000-8000-000000000012';
UPDATE public.vendors SET entity_name = 'ASIA'        WHERE id = 'a1000001-0000-4000-8000-000000000013';
UPDATE public.vendors SET entity_name = 'AMER'        WHERE id = 'a1000001-0000-4000-8000-000000000014';
UPDATE public.vendors SET entity_name = 'ASIA'        WHERE id = 'a1000001-0000-4000-8000-000000000015';
UPDATE public.vendors SET entity_name = 'AMER'        WHERE id = 'a1000001-0000-4000-8000-000000000016';
UPDATE public.vendors SET entity_name = 'UK'           WHERE id = 'a1000001-0000-4000-8000-000000000017';
UPDATE public.vendors SET entity_name = 'France'     WHERE id = 'a1000001-0000-4000-8000-000000000018';
UPDATE public.vendors SET entity_name = 'France'     WHERE id = 'a1000001-0000-4000-8000-000000000019';

-- Market Data type (was Data Provider)
UPDATE public.vendors SET type = 'Market Data' WHERE type = 'Data Provider';

-- Critical → Very High
UPDATE public.vendors SET inherent_risk = 'Very High' WHERE inherent_risk = 'Critical';
UPDATE public.vendors SET residual_risk = 'Very High' WHERE residual_risk = 'Critical';

-- =============================================================================
-- 3. Re-add check constraints
-- =============================================================================
ALTER TABLE public.vendors ADD CONSTRAINT vendors_type_check
  CHECK (type IN (
    'SaaS', 'On-Premise Software', 'Consulting', 'Payroll',
    'Cloud Infrastructure', 'Market Data', 'Managed Services'
  ));

ALTER TABLE public.vendors ADD CONSTRAINT vendors_inherent_risk_check
  CHECK (inherent_risk IN ('Low', 'Medium', 'High', 'Very High'));

ALTER TABLE public.vendors ADD CONSTRAINT vendors_residual_risk_check
  CHECK (residual_risk IN ('Low', 'Medium', 'High', 'Very High'));

ALTER TABLE public.vendors ADD CONSTRAINT vendors_data_type_check
  CHECK (data_type IN ('PII', 'Financial', 'Legal'));

ALTER TABLE public.vendors ADD CONSTRAINT vendors_data_classification_check
  CHECK (data_classification IN ('C0', 'C1', 'C2', 'C3'));

ALTER TABLE public.vendors ADD CONSTRAINT vendors_status_check
  CHECK (status IN ('Active', 'Offboarded', 'Under Review'));
