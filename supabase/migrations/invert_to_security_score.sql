-- risk_score now holds a security score: yes = 100, partial = 50, no = 0 (n/a excluded).
-- 100/100 means strong controls and lower risk.
UPDATE public.assessments a
SET risk_score = s.score
FROM (
  SELECT id,
    ROUND(AVG(CASE e.value WHEN 'yes' THEN 100 WHEN 'partial' THEN 50 WHEN 'no' THEN 0 END))::int AS score
  FROM public.assessments, jsonb_each_text(responses) e
  WHERE responses IS NOT NULL AND e.value IN ('yes', 'partial', 'no')
  GROUP BY id
) s
WHERE a.id = s.id;

UPDATE public.assessments
SET risk_score = 100 - risk_score
WHERE responses IS NULL AND risk_score IS NOT NULL;

COMMENT ON COLUMN public.assessments.risk_score IS
  'Security score 0-100 from the questionnaire; higher means stronger controls and lower risk.';
