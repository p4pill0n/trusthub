-- "Overdue" is derived in the app from launched_at; it is no longer a stored status.
UPDATE public.assessments
SET status = 'Completed'
WHERE status = 'Overdue' AND completed_at IS NOT NULL;

UPDATE public.assessments
SET status = 'Pending'
WHERE status = 'Overdue' AND completed_at IS NULL;

ALTER TABLE public.assessments DROP CONSTRAINT IF EXISTS assessments_status_check;
ALTER TABLE public.assessments
  ADD CONSTRAINT assessments_status_check
  CHECK (status IN ('Pending', 'In Progress', 'Completed'));

-- Fourth-party risk uses the same scale as vendor risk.
ALTER TABLE public.fourth_parties DROP CONSTRAINT IF EXISTS fourth_parties_risk_level_check;
UPDATE public.fourth_parties SET risk_level = 'Very High' WHERE risk_level = 'Critical';
ALTER TABLE public.fourth_parties
  ADD CONSTRAINT fourth_parties_risk_level_check
  CHECK (risk_level IN ('Low', 'Medium', 'High', 'Very High'));

-- Incidents can be logged from the app.
DROP POLICY IF EXISTS "Anon can insert security_incidents for demo" ON public.security_incidents;
CREATE POLICY "Anon can insert security_incidents for demo"
  ON public.security_incidents FOR INSERT TO anon WITH CHECK (true);
