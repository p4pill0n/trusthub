-- Rebalance assessment pipeline dates across Overdue / <30d / 30–90d / >90d
-- Policy cadence preserved: Low/Medium +36m, High +24m, Very High +12m

UPDATE vendors SET last_review_date = '2025-06-15', next_review_date = '2026-06-15' WHERE name = 'Stripe';
UPDATE vendors SET last_review_date = '2025-07-20', next_review_date = '2026-07-20' WHERE name = 'Murex';
UPDATE vendors SET last_review_date = '2025-08-10', next_review_date = '2026-08-10' WHERE name = 'SAP';
UPDATE vendors SET last_review_date = '2025-08-28', next_review_date = '2026-08-28' WHERE name = 'FIS';
UPDATE vendors SET last_review_date = '2024-07-15', next_review_date = '2026-07-15' WHERE name = 'Bloomberg';
UPDATE vendors SET last_review_date = '2024-08-20', next_review_date = '2026-08-20' WHERE name = 'Oracle';

UPDATE vendors SET last_review_date = '2024-10-15', next_review_date = '2026-10-15' WHERE name = 'ServiceNow';
UPDATE vendors SET last_review_date = '2024-10-20', next_review_date = '2026-10-20' WHERE name = 'Cisco';
UPDATE vendors SET last_review_date = '2024-10-25', next_review_date = '2026-10-25' WHERE name = 'Fidessa';
UPDATE vendors SET last_review_date = '2024-10-28', next_review_date = '2026-10-28' WHERE name = 'Zellis';
UPDATE vendors SET last_review_date = '2024-11-01', next_review_date = '2026-11-01' WHERE name = 'EquiLend';

UPDATE vendors SET last_review_date = '2024-11-20', next_review_date = '2026-11-20' WHERE name = 'AWS';
UPDATE vendors SET last_review_date = '2024-12-05', next_review_date = '2026-12-05' WHERE name = 'Workday';
UPDATE vendors SET last_review_date = '2024-12-15', next_review_date = '2026-12-15' WHERE name = 'ION Group';
UPDATE vendors SET last_review_date = '2024-12-28', next_review_date = '2026-12-28' WHERE name = 'IBM';
UPDATE vendors SET last_review_date = '2023-12-01', next_review_date = '2026-12-01' WHERE name = 'Splunk';
UPDATE vendors SET last_review_date = '2023-12-30', next_review_date = '2026-12-30' WHERE name = 'COLT';

UPDATE vendors SET last_review_date = '2024-05-10', next_review_date = '2027-05-10' WHERE name = 'BCD Travel';
UPDATE vendors SET last_review_date = '2024-06-22', next_review_date = '2027-06-22' WHERE name = 'WPA';
UPDATE vendors SET last_review_date = '2024-08-01', next_review_date = '2027-08-01' WHERE name = 'DocuSign';
UPDATE vendors SET last_review_date = '2024-09-15', next_review_date = '2027-09-15' WHERE name = 'CrowdStrike';
UPDATE vendors SET last_review_date = '2024-10-20', next_review_date = '2027-10-20' WHERE name = 'Microsoft';
UPDATE vendors SET last_review_date = '2024-11-12', next_review_date = '2027-11-12' WHERE name = 'TOPdesk';
UPDATE vendors SET last_review_date = '2025-01-20', next_review_date = '2028-01-20' WHERE name = 'Deloitte';
UPDATE vendors SET last_review_date = '2025-02-05', next_review_date = '2028-02-05' WHERE name = 'Accenture';
UPDATE vendors SET last_review_date = '2025-03-20', next_review_date = '2028-03-20' WHERE name = 'Twilio';
UPDATE vendors SET last_review_date = '2025-04-01', next_review_date = '2028-04-01' WHERE name = 'Zendesk';
