-- Broadcast campaigns and per-vendor follow-up tracking

CREATE TABLE IF NOT EXISTS broadcasts (
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

CREATE TABLE IF NOT EXISTS broadcast_recipients (
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

CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_status ON broadcast_recipients(status);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_broadcast ON broadcast_recipients(broadcast_id);

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read broadcasts"
  ON broadcasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert broadcasts"
  ON broadcasts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update broadcasts"
  ON broadcasts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read broadcast_recipients"
  ON broadcast_recipients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert broadcast_recipients"
  ON broadcast_recipients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update broadcast_recipients"
  ON broadcast_recipients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Anon can read broadcasts for demo"
  ON broadcasts FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert broadcasts for demo"
  ON broadcasts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update broadcasts for demo"
  ON broadcasts FOR UPDATE TO anon USING (true);

CREATE POLICY "Anon can read broadcast_recipients for demo"
  ON broadcast_recipients FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert broadcast_recipients for demo"
  ON broadcast_recipients FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update broadcast_recipients for demo"
  ON broadcast_recipients FOR UPDATE TO anon USING (true);
