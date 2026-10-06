-- Risk score now means "higher = riskier": yes = 0, partial = 50, no = 100 (n/a excluded).
UPDATE public.assessments a
SET risk_score = s.score
FROM (
  SELECT id,
    ROUND(AVG(CASE e.value WHEN 'yes' THEN 0 WHEN 'partial' THEN 50 WHEN 'no' THEN 100 END))::int AS score
  FROM public.assessments, jsonb_each_text(responses) e
  WHERE responses IS NOT NULL AND e.value IN ('yes', 'partial', 'no')
  GROUP BY id
) s
WHERE a.id = s.id;

-- A completed assessment is a review: move last_review_date forward to it.
WITH latest AS (
  SELECT vendor_id, MAX(completed_at)::date AS completed_on
  FROM public.assessments
  WHERE completed_at IS NOT NULL
  GROUP BY vendor_id
)
UPDATE public.vendors v
SET last_review_date = latest.completed_on
FROM latest
WHERE v.id = latest.vendor_id
  AND v.status <> 'Offboarded'
  AND (v.last_review_date IS NULL OR v.last_review_date < latest.completed_on);

-- Recompute next review from the saved policy (same rule as the app).
WITH policy AS (
  SELECT review_months_low, review_months_medium, review_months_high, review_months_very_high
  FROM public.tprm_policy
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
)
UPDATE public.vendors v
SET next_review_date = CASE
  WHEN v.status = 'Offboarded' OR v.last_review_date IS NULL THEN NULL
  ELSE (v.last_review_date + make_interval(months => CASE v.inherent_risk
    WHEN 'Low' THEN COALESCE(p.review_months_low, 36)
    WHEN 'Medium' THEN COALESCE(p.review_months_medium, 36)
    WHEN 'High' THEN COALESCE(p.review_months_high, 24)
    WHEN 'Very High' THEN COALESCE(p.review_months_very_high, 12)
    ELSE COALESCE(p.review_months_medium, 36)
  END))::date
END
FROM (SELECT 1) one
LEFT JOIN policy p ON true;
