-- Align review cadence policy and vendor next_review_date with:
-- Low 36 months, Medium 36 months, High 24 months, Very High 12 months

UPDATE tprm_policy
SET
  review_months_low = 36,
  review_months_medium = 36,
  review_months_high = 24,
  review_months_very_high = 12,
  updated_at = NOW();

UPDATE vendors
SET next_review_date = (
  last_review_date + (
    CASE inherent_risk
      WHEN 'Low' THEN INTERVAL '36 months'
      WHEN 'Medium' THEN INTERVAL '36 months'
      WHEN 'High' THEN INTERVAL '24 months'
      WHEN 'Very High' THEN INTERVAL '12 months'
      WHEN 'Critical' THEN INTERVAL '12 months'
      ELSE INTERVAL '36 months'
    END
  )
)::date
WHERE last_review_date IS NOT NULL;

-- Keep assessment overdue flags consistent with vendor next_review_date
UPDATE assessments a
SET status = 'Overdue'
FROM vendors v
WHERE a.vendor_id = v.id
  AND a.status IN ('Completed', 'Overdue')
  AND v.next_review_date IS NOT NULL
  AND v.next_review_date::date < CURRENT_DATE;

UPDATE assessments a
SET status = 'Completed'
FROM vendors v
WHERE a.vendor_id = v.id
  AND a.status = 'Overdue'
  AND v.next_review_date IS NOT NULL
  AND v.next_review_date::date >= CURRENT_DATE;
