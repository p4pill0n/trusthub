-- TPRM policy settings (singleton row for demo / org defaults)

CREATE TABLE IF NOT EXISTS tprm_policy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_months_low INTEGER NOT NULL DEFAULT 36 CHECK (review_months_low > 0),
  review_months_medium INTEGER NOT NULL DEFAULT 36 CHECK (review_months_medium > 0),
  review_months_high INTEGER NOT NULL DEFAULT 24 CHECK (review_months_high > 0),
  review_months_very_high INTEGER NOT NULL DEFAULT 12 CHECK (review_months_very_high > 0),
  review_months_c0 INTEGER NOT NULL DEFAULT 36 CHECK (review_months_c0 > 0),
  review_months_c1 INTEGER NOT NULL DEFAULT 24 CHECK (review_months_c1 > 0),
  review_months_c2 INTEGER NOT NULL DEFAULT 12 CHECK (review_months_c2 > 0),
  review_months_c3 INTEGER NOT NULL DEFAULT 6 CHECK (review_months_c3 > 0),
  cadence_rule TEXT NOT NULL DEFAULT 'strictest'
    CHECK (cadence_rule IN ('strictest', 'risk', 'classification')),
  require_assessment_before_go_live BOOLEAN NOT NULL DEFAULT true,
  review_within_days_of_new_connection INTEGER NOT NULL DEFAULT 30
    CHECK (review_within_days_of_new_connection > 0),
  escalate_bidirectional BOOLEAN NOT NULL DEFAULT true,
  require_encryption_for_c2_plus BOOLEAN NOT NULL DEFAULT true,
  max_unreviewed_connections INTEGER NOT NULL DEFAULT 5
    CHECK (max_unreviewed_connections >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID
);

ALTER TABLE tprm_policy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tprm_policy"
  ON tprm_policy FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own tprm_policy"
  ON tprm_policy FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own tprm_policy"
  ON tprm_policy FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anon can read tprm_policy for demo"
  ON tprm_policy FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert tprm_policy for demo"
  ON tprm_policy FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update tprm_policy for demo"
  ON tprm_policy FOR UPDATE TO anon USING (true);

INSERT INTO tprm_policy (review_months_low)
SELECT 36
WHERE NOT EXISTS (SELECT 1 FROM tprm_policy LIMIT 1);
