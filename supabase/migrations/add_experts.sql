-- Regional expert contacts for TPRM / Cyber / BCM / OpRisk / Legal / Compliance

CREATE TABLE IF NOT EXISTS experts (
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

INSERT INTO experts (region, domain, name, email, title) VALUES
('France', 'TPRM', 'Camille Moreau', 'camille.moreau@bank.example', 'TPRM Lead — France'),
('France', 'Cyber', 'Julien Bernard', 'julien.bernard@bank.example', 'Cyber Risk Manager — France'),
('France', 'BCM', 'Sophie Laurent', 'sophie.laurent@bank.example', 'BCM Coordinator — France'),
('France', 'Operational Risk', 'Antoine Petit', 'antoine.petit@bank.example', 'OpRisk Officer — France'),
('France', 'Legal', 'Marie Dupont', 'marie.dupont@bank.example', 'Legal Counsel — France'),
('France', 'Compliance', 'Nicolas Rousseau', 'nicolas.rousseau@bank.example', 'Compliance Officer — France'),
('UK', 'TPRM', 'Kim Tata', 'kim.tata@bank.example', 'TPRM Lead — UK'),
('UK', 'Cyber', 'Aurelien Chu', 'aurelien.chu@bank.example', 'Cyber Risk Manager — UK'),
('UK', 'BCM', 'Olivia Hughes', 'olivia.hughes@bank.example', 'BCM Coordinator — UK'),
('UK', 'Operational Risk', 'Daniel Price', 'daniel.price@bank.example', 'OpRisk Officer — UK'),
('UK', 'Legal', 'Hannah Reid', 'hannah.reid@bank.example', 'Legal Counsel — UK'),
('UK', 'Compliance', 'William Scott', 'william.scott@bank.example', 'Compliance Officer — UK'),
('AMER', 'TPRM', 'Sarah Mitchell', 'sarah.mitchell@bank.example', 'TPRM Lead — AMER'),
('AMER', 'Cyber', 'Michael Torres', 'michael.torres@bank.example', 'Cyber Risk Manager — AMER'),
('AMER', 'BCM', 'Jessica Nguyen', 'jessica.nguyen@bank.example', 'BCM Coordinator — AMER'),
('AMER', 'Operational Risk', 'David Kim', 'david.kim@bank.example', 'OpRisk Officer — AMER'),
('AMER', 'Legal', 'Rachel Cohen', 'rachel.cohen@bank.example', 'Legal Counsel — AMER'),
('AMER', 'Compliance', 'Andrew Brooks', 'andrew.brooks@bank.example', 'Compliance Officer — AMER'),
('ASIA', 'TPRM', 'Mei Ling Tan', 'mei.ling.tan@bank.example', 'TPRM Lead — ASIA'),
('ASIA', 'Cyber', 'Hiroshi Nakamura', 'hiroshi.nakamura@bank.example', 'Cyber Risk Manager — ASIA'),
('ASIA', 'BCM', 'Priya Sharma', 'priya.sharma@bank.example', 'BCM Coordinator — ASIA'),
('ASIA', 'Operational Risk', 'Wei Chen', 'wei.chen@bank.example', 'OpRisk Officer — ASIA'),
('ASIA', 'Legal', 'Aisha Rahman', 'aisha.rahman@bank.example', 'Legal Counsel — ASIA'),
('ASIA', 'Compliance', 'Kenji Sato', 'kenji.sato@bank.example', 'Compliance Officer — ASIA'),
('India', 'TPRM', 'Ananya Iyer', 'ananya.iyer@bank.example', 'TPRM Lead — India'),
('India', 'Cyber', 'Rohan Mehta', 'rohan.mehta@bank.example', 'Cyber Risk Manager — India'),
('India', 'BCM', 'Neha Kapoor', 'neha.kapoor@bank.example', 'BCM Coordinator — India'),
('India', 'Operational Risk', 'Arjun Desai', 'arjun.desai@bank.example', 'OpRisk Officer — India'),
('India', 'Legal', 'Sneha Nair', 'sneha.nair@bank.example', 'Legal Counsel — India'),
('India', 'Compliance', 'Vikram Malhotra', 'vikram.malhotra@bank.example', 'Compliance Officer — India')
ON CONFLICT (region, domain) DO NOTHING;
