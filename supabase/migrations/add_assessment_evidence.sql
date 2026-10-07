-- Supporting evidence attached by vendors on questionnaire submit
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.assessments.evidence IS
  'Questionnaire evidence items: [{id, type, label, notes, file_name, file_path, file_url}]';

-- Public bucket for questionnaire evidence uploads (demo-friendly anon access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assessment-evidence',
  'assessment-evidence',
  true,
  5242880,
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anon can upload assessment evidence" ON storage.objects;
CREATE POLICY "Anon can upload assessment evidence"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'assessment-evidence');

DROP POLICY IF EXISTS "Anyone can read assessment evidence" ON storage.objects;
CREATE POLICY "Anyone can read assessment evidence"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'assessment-evidence');

DROP POLICY IF EXISTS "Anon can update assessment evidence" ON storage.objects;
CREATE POLICY "Anon can update assessment evidence"
  ON storage.objects FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'assessment-evidence');

DROP POLICY IF EXISTS "Anon can delete assessment evidence" ON storage.objects;
CREATE POLICY "Anon can delete assessment evidence"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = 'assessment-evidence');
