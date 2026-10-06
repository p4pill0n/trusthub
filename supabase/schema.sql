-- Trust Hub TPRM Platform Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  entity_name TEXT NOT NULL, -- bank internal entity: France, UK, AMER, ASIA, India
  type TEXT NOT NULL CHECK (type IN ('SaaS', 'On-Premise Software', 'Consulting', 'Payroll', 'Cloud Infrastructure', 'Market Data', 'Managed Services')),
  datacontact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  os_manager_name TEXT,
  data_type TEXT NOT NULL CHECK (data_type IN ('PII', 'Financial', 'Legal')),
  data_classification TEXT NOT NULL CHECK (data_classification IN ('C0', 'C1', 'C2', 'C3')),
  inherent_risk TEXT NOT NULL CHECK (inherent_risk IN ('Low', 'Medium', 'High', 'Very High')),
  residual_risk TEXT NOT NULL CHECK (residual_risk IN ('Low', 'Medium', 'High', 'Very High')),
  last_review_date DATE,
  next_review_date DATE,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Offboarded', 'Under Review')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Assessments
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  launched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  -- "Overdue" is derived in the app from launched_at, not stored.
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  assessor_notes TEXT,
  questionnaire_token TEXT UNIQUE,
  responses JSONB,
  user_id UUID REFERENCES auth.users(id)
);

-- Security Incidents
CREATE TABLE security_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  detected_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Resolved')),
  user_id UUID REFERENCES auth.users(id)
);

-- BitSight Ratings
CREATE TABLE bitsight_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 900),
  rating TEXT NOT NULL CHECK (rating IN ('Advanced', 'Intermediate', 'Basic', 'Beginners')),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Interconnections
CREATE TABLE interconnections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('Inbound', 'Outbound', 'Bidirectional')),
  connection_type TEXT NOT NULL CHECK (connection_type IN ('API', 'SFTP', 'VPN', 'Direct Link', 'Portal')),
  description TEXT,
  user_id UUID REFERENCES auth.users(id)
);

-- Remediations
CREATE TABLE remediations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
  due_date DATE,
  owner TEXT,
  evidence TEXT,
  user_id UUID REFERENCES auth.users(id)
);

-- Fourth Parties
CREATE TABLE fourth_parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_description TEXT,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High', 'Very High')),
  country TEXT,
  user_id UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_next_review ON vendors(next_review_date);
CREATE INDEX idx_assessments_vendor ON assessments(vendor_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_incidents_vendor ON security_incidents(vendor_id);
CREATE INDEX idx_remediations_status ON remediations(status);

-- Row Level Security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitsight_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE interconnections ENABLE ROW LEVEL SECURITY;
ALTER TABLE remediations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fourth_parties ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all records
CREATE POLICY "Authenticated users can read vendors"
  ON vendors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read assessments"
  ON assessments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read security_incidents"
  ON security_incidents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read bitsight_ratings"
  ON bitsight_ratings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read interconnections"
  ON interconnections FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read remediations"
  ON remediations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read fourth_parties"
  ON fourth_parties FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert/update their own records
CREATE POLICY "Users can insert own vendors"
  ON vendors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own vendors"
  ON vendors FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own assessments"
  ON assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own assessments"
  ON assessments FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own assessments"
  ON assessments FOR DELETE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own security_incidents"
  ON security_incidents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own security_incidents"
  ON security_incidents FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own bitsight_ratings"
  ON bitsight_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own bitsight_ratings"
  ON bitsight_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own interconnections"
  ON interconnections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own interconnections"
  ON interconnections FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own remediations"
  ON remediations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own remediations"
  ON remediations FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own fourth_parties"
  ON fourth_parties FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own fourth_parties"
  ON fourth_parties FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow anon read for demo (optional - remove in production)
CREATE POLICY "Anon can read vendors for demo"
  ON vendors FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can read assessments for demo"
  ON assessments FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can read security_incidents for demo"
  ON security_incidents FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can read bitsight_ratings for demo"
  ON bitsight_ratings FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can read interconnections for demo"
  ON interconnections FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can read remediations for demo"
  ON remediations FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can read fourth_parties for demo"
  ON fourth_parties FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert vendors for demo"
  ON vendors FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update vendors for demo"
  ON vendors FOR UPDATE TO anon USING (true);

CREATE POLICY "Anon can insert assessments for demo"
  ON assessments FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update assessments for demo"
  ON assessments FOR UPDATE TO anon USING (true);

CREATE POLICY "Anon can delete assessments for demo"
  ON assessments FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can insert remediations for demo"
  ON remediations FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update remediations for demo"
  ON remediations FOR UPDATE TO anon USING (true);

CREATE POLICY "Anon can insert security_incidents for demo"
  ON security_incidents FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update security_incidents for demo"
  ON security_incidents FOR UPDATE TO anon USING (true);

CREATE POLICY "Anon can update interconnections for demo"
  ON interconnections FOR UPDATE TO anon USING (true);

-- ---------------------------------------------------------------------------
-- TPRM policy settings
-- ---------------------------------------------------------------------------
CREATE TABLE tprm_policy (
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


-- Broadcasts
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  broadcast_type TEXT NOT NULL CHECK (broadcast_type IN ('Policy update', 'Major vulnerability', 'Incident notice', 'General')),
  audience TEXT NOT NULL CHECK (audience IN ('All active vendors', 'By inherent risk', 'Selected vendors')),
  audience_risk TEXT CHECK (audience_risk IN ('Low', 'Medium', 'High', 'Very High') OR audience_risk IS NULL),
  status TEXT NOT NULL DEFAULT 'Sent' CHECK (status IN ('Draft', 'Sent')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  follow_up_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID
);

CREATE TABLE broadcast_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcast_id UUID NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Ongoing'
    CHECK (status IN ('Compliant', 'Not Compliant', 'Ongoing')),
  follow_up_notes TEXT,
  followed_up_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (broadcast_id, vendor_id)
);

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read broadcasts"
  ON broadcasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert broadcasts"
  ON broadcasts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update broadcasts"
  ON broadcasts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete broadcasts"
  ON broadcasts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Anon can read broadcasts for demo"
  ON broadcasts FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert broadcasts for demo"
  ON broadcasts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update broadcasts for demo"
  ON broadcasts FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can delete broadcasts for demo"
  ON broadcasts FOR DELETE TO anon USING (true);

CREATE POLICY "Authenticated users can read broadcast_recipients"
  ON broadcast_recipients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert broadcast_recipients"
  ON broadcast_recipients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update broadcast_recipients"
  ON broadcast_recipients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete broadcast_recipients"
  ON broadcast_recipients FOR DELETE TO authenticated USING (true);

CREATE POLICY "Anon can read broadcast_recipients for demo"
  ON broadcast_recipients FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert broadcast_recipients for demo"
  ON broadcast_recipients FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update broadcast_recipients for demo"
  ON broadcast_recipients FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can delete broadcast_recipients for demo"
  ON broadcast_recipients FOR DELETE TO anon USING (true);

-- Expert contacts (one per region and domain)
CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region TEXT NOT NULL CHECK (region IN ('France', 'UK', 'AMER', 'ASIA', 'India')),
  domain TEXT NOT NULL CHECK (domain IN ('TPRM', 'Cyber', 'BCM', 'Operational Risk', 'Legal', 'Compliance')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  UNIQUE (region, domain)
);

ALTER TABLE experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read experts"
  ON experts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert experts"
  ON experts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update experts"
  ON experts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete experts"
  ON experts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Anon can read experts for demo"
  ON experts FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert experts for demo"
  ON experts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update experts for demo"
  ON experts FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can delete experts for demo"
  ON experts FOR DELETE TO anon USING (true);
