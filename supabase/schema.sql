-- Trust Hub TPRM Platform Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  entity_name TEXT NOT NULL, -- bank internal entity: France, UK, AMER, ASIA
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
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Overdue')),
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
  user_id UUID REFERENCES auth.users(id)
);

-- Fourth Parties
CREATE TABLE fourth_parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_description TEXT,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
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

CREATE POLICY "Anon can insert remediations for demo"
  ON remediations FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update remediations for demo"
  ON remediations FOR UPDATE TO anon USING (true);
