-- Update entity_name to regions (France, UK, AMER, ASIA)
-- Safe to run — does not touch check constraints

ALTER TABLE public.vendors DROP COLUMN IF EXISTS country;

UPDATE public.vendors SET entity_name = 'UK'     WHERE id = 'a1000001-0000-4000-8000-000000000001';
UPDATE public.vendors SET entity_name = 'France' WHERE id = 'a1000001-0000-4000-8000-000000000002';
UPDATE public.vendors SET entity_name = 'UK'     WHERE id = 'a1000001-0000-4000-8000-000000000003';
UPDATE public.vendors SET entity_name = 'AMER'   WHERE id = 'a1000001-0000-4000-8000-000000000004';
UPDATE public.vendors SET entity_name = 'AMER'   WHERE id = 'a1000001-0000-4000-8000-000000000005';
UPDATE public.vendors SET entity_name = 'France' WHERE id = 'a1000001-0000-4000-8000-000000000006';
UPDATE public.vendors SET entity_name = 'AMER'   WHERE id = 'a1000001-0000-4000-8000-000000000007';
UPDATE public.vendors SET entity_name = 'ASIA'   WHERE id = 'a1000001-0000-4000-8000-000000000008';
UPDATE public.vendors SET entity_name = 'AMER'   WHERE id = 'a1000001-0000-4000-8000-000000000009';
UPDATE public.vendors SET entity_name = 'UK'     WHERE id = 'a1000001-0000-4000-8000-00000000000a';
UPDATE public.vendors SET entity_name = 'France' WHERE id = 'a1000001-0000-4000-8000-00000000000b';
UPDATE public.vendors SET entity_name = 'AMER'   WHERE id = 'a1000001-0000-4000-8000-00000000000c';
UPDATE public.vendors SET entity_name = 'France' WHERE id = 'a1000001-0000-4000-8000-00000000000d';
UPDATE public.vendors SET entity_name = 'AMER'   WHERE id = 'a1000001-0000-4000-8000-00000000000e';
UPDATE public.vendors SET entity_name = 'AMER'   WHERE id = 'a1000001-0000-4000-8000-00000000000f';
UPDATE public.vendors SET entity_name = 'UK'     WHERE id = 'a1000001-0000-4000-8000-000000000010';
UPDATE public.vendors SET entity_name = 'UK'     WHERE id = 'a1000001-0000-4000-8000-000000000011';
UPDATE public.vendors SET entity_name = 'AMER'   WHERE id = 'a1000001-0000-4000-8000-000000000012';
UPDATE public.vendors SET entity_name = 'ASIA'   WHERE id = 'a1000001-0000-4000-8000-000000000013';
UPDATE public.vendors SET entity_name = 'AMER'   WHERE id = 'a1000001-0000-4000-8000-000000000014';
UPDATE public.vendors SET entity_name = 'ASIA'   WHERE id = 'a1000001-0000-4000-8000-000000000015';
UPDATE public.vendors SET entity_name = 'AMER'   WHERE id = 'a1000001-0000-4000-8000-000000000016';
UPDATE public.vendors SET entity_name = 'UK'     WHERE id = 'a1000001-0000-4000-8000-000000000017';
UPDATE public.vendors SET entity_name = 'France' WHERE id = 'a1000001-0000-4000-8000-000000000018';
UPDATE public.vendors SET entity_name = 'France' WHERE id = 'a1000001-0000-4000-8000-000000000019';
