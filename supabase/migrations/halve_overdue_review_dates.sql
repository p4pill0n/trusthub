-- Halve overdue days for vendors with past-due next_review_date
UPDATE public.vendors
SET next_review_date = CURRENT_DATE - ((CURRENT_DATE - next_review_date::date) / 2)
WHERE next_review_date::date < CURRENT_DATE;
