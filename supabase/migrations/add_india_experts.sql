-- Add India region to experts and seed domain contacts

ALTER TABLE experts DROP CONSTRAINT IF EXISTS experts_region_check;
ALTER TABLE experts ADD CONSTRAINT experts_region_check
  CHECK (region IN ('France', 'UK', 'AMER', 'ASIA', 'India'));

INSERT INTO experts (region, domain, name, email, title) VALUES
('India', 'TPRM', 'Ananya Iyer', 'ananya.iyer@bank.example', 'TPRM Lead — India'),
('India', 'Cyber', 'Rohan Mehta', 'rohan.mehta@bank.example', 'Cyber Risk Manager — India'),
('India', 'BCM', 'Neha Kapoor', 'neha.kapoor@bank.example', 'BCM Coordinator — India'),
('India', 'Operational Risk', 'Arjun Desai', 'arjun.desai@bank.example', 'OpRisk Officer — India'),
('India', 'Legal', 'Sneha Nair', 'sneha.nair@bank.example', 'Legal Counsel — India'),
('India', 'Compliance', 'Vikram Malhotra', 'vikram.malhotra@bank.example', 'Compliance Officer — India')
ON CONFLICT (region, domain) DO NOTHING;
