-- Ensure BitSight and interconnections cover all active vendors

INSERT INTO bitsight_ratings (vendor_id, score, rating, fetched_at)
SELECT v.id, s.score, s.rating, '2026-06-01 00:00:00+00'
FROM (VALUES
  ('BCD Travel', 680, 'Intermediate'),
  ('Cisco', 710, 'Advanced'),
  ('COLT', 640, 'Intermediate'),
  ('EquiLend', 620, 'Basic'),
  ('Fidessa', 600, 'Basic'),
  ('FIS', 580, 'Basic'),
  ('ION Group', 655, 'Intermediate'),
  ('Microsoft', 780, 'Advanced'),
  ('Murex', 545, 'Basic'),
  ('TOPdesk', 715, 'Advanced'),
  ('WPA', 675, 'Intermediate'),
  ('Zellis', 635, 'Intermediate')
) AS s(name, score, rating)
JOIN vendors v ON v.name = s.name
WHERE NOT EXISTS (SELECT 1 FROM bitsight_ratings b WHERE b.vendor_id = v.id);

INSERT INTO interconnections (vendor_id, direction, connection_type, description)
SELECT v.id, s.direction, s.connection_type, s.description
FROM (VALUES
  ('Accenture', 'Outbound', 'Portal', 'Consulting engagement delivery portal'),
  ('BCD Travel', 'Bidirectional', 'API', 'Corporate travel booking and expense feeds'),
  ('Cisco', 'Inbound', 'VPN', 'Network device management and telemetry'),
  ('COLT', 'Bidirectional', 'Direct Link', 'Dedicated network connectivity services'),
  ('Deloitte', 'Outbound', 'Portal', 'Advisory project collaboration workspace'),
  ('EquiLend', 'Inbound', 'API', 'Securities lending market data and trade feeds'),
  ('Fidessa', 'Bidirectional', 'API', 'Trading desk order and market connectivity'),
  ('FIS', 'Bidirectional', 'SFTP', 'Core banking batch file exchange'),
  ('ION Group', 'Inbound', 'API', 'Trading and risk analytics data feeds'),
  ('Microsoft', 'Bidirectional', 'API', 'Microsoft 365 and Azure identity integration'),
  ('Murex', 'Inbound', 'VPN', 'Trading platform remote administration'),
  ('TOPdesk', 'Outbound', 'API', 'IT service desk ticket synchronization'),
  ('WPA', 'Outbound', 'SFTP', 'Payroll and benefits data transfer'),
  ('Zellis', 'Bidirectional', 'API', 'HR and payroll system integration')
) AS s(name, direction, connection_type, description)
JOIN vendors v ON v.name = s.name
WHERE NOT EXISTS (SELECT 1 FROM interconnections i WHERE i.vendor_id = v.id);
