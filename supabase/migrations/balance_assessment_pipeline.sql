-- Balance assessment pipeline (as of 2026-06-08): 8 overdue, 5 <30d, 5 30–90d, 4 >90d
-- Keeps 8 overdue assessments KPI unchanged

-- Overdue (8)
UPDATE public.vendors SET last_review_date = '2026-02-08', next_review_date = '2026-05-08' WHERE id = 'a1000001-0000-4000-8000-000000000002';
UPDATE public.vendors SET last_review_date = '2026-01-08', next_review_date = '2026-04-08' WHERE id = 'a1000001-0000-4000-8000-000000000003';
UPDATE public.vendors SET last_review_date = '2025-12-08', next_review_date = '2026-03-08' WHERE id = 'a1000001-0000-4000-8000-000000000004';
UPDATE public.vendors SET last_review_date = '2025-11-08', next_review_date = '2026-02-08' WHERE id = 'a1000001-0000-4000-8000-000000000008';
UPDATE public.vendors SET last_review_date = '2025-10-10', next_review_date = '2026-01-10' WHERE id = 'a1000001-0000-4000-8000-00000000000c';
UPDATE public.vendors SET last_review_date = '2025-09-22', next_review_date = '2025-12-22' WHERE id = 'a1000001-0000-4000-8000-00000000000d';
UPDATE public.vendors SET last_review_date = '2025-08-18', next_review_date = '2025-11-18' WHERE id = 'a1000001-0000-4000-8000-000000000010';
UPDATE public.vendors SET last_review_date = '2025-07-12', next_review_date = '2025-10-12' WHERE id = 'a1000001-0000-4000-8000-000000000016';

-- Due within 30 days (5)
UPDATE public.vendors SET last_review_date = '2026-03-20', next_review_date = '2026-06-20' WHERE id = 'a1000001-0000-4000-8000-000000000001';
UPDATE public.vendors SET last_review_date = '2026-03-25', next_review_date = '2026-06-25' WHERE id = 'a1000001-0000-4000-8000-000000000005';
UPDATE public.vendors SET last_review_date = '2026-04-01', next_review_date = '2026-07-01' WHERE id = 'a1000001-0000-4000-8000-000000000006';
UPDATE public.vendors SET last_review_date = '2026-04-05', next_review_date = '2026-07-05' WHERE id = 'a1000001-0000-4000-8000-000000000007';
UPDATE public.vendors SET last_review_date = '2026-03-15', next_review_date = '2026-06-15' WHERE id = 'a1000001-0000-4000-8000-00000000000b';

-- Due in 30–90 days (5)
UPDATE public.vendors SET last_review_date = '2026-04-20', next_review_date = '2026-07-20' WHERE id = 'a1000001-0000-4000-8000-000000000009';
UPDATE public.vendors SET last_review_date = '2026-05-01', next_review_date = '2026-08-01' WHERE id = 'a1000001-0000-4000-8000-00000000000e';
UPDATE public.vendors SET last_review_date = '2026-05-15', next_review_date = '2026-08-15' WHERE id = 'a1000001-0000-4000-8000-00000000000f';
UPDATE public.vendors SET last_review_date = '2026-05-28', next_review_date = '2026-08-28' WHERE id = 'a1000001-0000-4000-8000-000000000012';
UPDATE public.vendors SET last_review_date = '2026-06-05', next_review_date = '2026-09-05' WHERE id = 'a1000001-0000-4000-8000-000000000014';

-- Due beyond 90 days (4)
UPDATE public.vendors SET last_review_date = '2026-06-20', next_review_date = '2026-09-20' WHERE id = 'a1000001-0000-4000-8000-00000000000a';
UPDATE public.vendors SET last_review_date = '2026-07-05', next_review_date = '2026-10-05' WHERE id = 'a1000001-0000-4000-8000-000000000011';
UPDATE public.vendors SET last_review_date = '2026-07-20', next_review_date = '2026-10-20' WHERE id = 'a1000001-0000-4000-8000-000000000013';
UPDATE public.vendors SET last_review_date = '2026-08-01', next_review_date = '2026-11-01' WHERE id = 'a1000001-0000-4000-8000-000000000015';
