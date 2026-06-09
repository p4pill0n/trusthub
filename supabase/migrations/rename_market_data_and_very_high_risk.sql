-- Rename Data Provider → Market Data, Critical → Very High
-- IMPORTANT: drop constraints BEFORE updating values

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

UPDATE public.vendors SET type = 'Market Data' WHERE type = 'Data Provider';
UPDATE public.vendors SET inherent_risk = 'Very High' WHERE inherent_risk = 'Critical';
UPDATE public.vendors SET residual_risk = 'Very High' WHERE residual_risk = 'Critical';

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
