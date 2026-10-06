-- Increase fourth-party occurrences by linking shared providers to more parents

INSERT INTO fourth_parties (parent_vendor_id, name, service_description, risk_level, country)
SELECT v.id, s.name, s.service_description, s.risk_level, s.country
FROM (VALUES
  ('Microsoft', 'Datadog', 'Cloud monitoring and observability', 'Low', 'United States'),
  ('ServiceNow', 'Datadog', 'Platform performance monitoring', 'Low', 'United States'),
  ('Splunk', 'Datadog', 'Infrastructure metrics alongside SIEM', 'Low', 'United States'),
  ('CrowdStrike', 'Datadog', 'Endpoint telemetry observability', 'Low', 'United States'),
  ('Zendesk', 'Datadog', 'SaaS application monitoring', 'Low', 'United States'),
  ('Workday', 'AWS', 'Cloud hosting for HR workloads', 'Medium', 'United States'),
  ('Oracle', 'AWS', 'Hybrid cloud hosting for ERP components', 'Medium', 'United States'),
  ('Murex', 'AWS', 'Cloud hosting for trading platform components', 'Medium', 'United States'),
  ('Fidessa', 'AWS', 'Cloud hosting for trading connectivity', 'Medium', 'United States'),
  ('TOPdesk', 'AWS', 'SaaS hosting infrastructure', 'Low', 'United States'),
  ('ServiceNow', 'PagerDuty', 'Incident management and alerting', 'Low', 'United States'),
  ('Splunk', 'PagerDuty', 'SIEM-triggered on-call alerting', 'Low', 'United States'),
  ('CrowdStrike', 'PagerDuty', 'Security incident paging', 'Medium', 'United States'),
  ('Microsoft', 'PagerDuty', 'Cloud operations alerting', 'Low', 'United States'),
  ('Twilio', 'Cloudflare', 'CDN and edge security', 'Low', 'United States'),
  ('Zendesk', 'Cloudflare', 'CDN and DDoS protection', 'Low', 'United States'),
  ('DocuSign', 'Cloudflare', 'Edge delivery and WAF', 'Low', 'United States'),
  ('Accenture', 'Cloudflare', 'Client portal edge security', 'Low', 'United States'),
  ('COLT', 'Cloudflare', 'Network edge acceleration', 'Low', 'United States'),
  ('Bloomberg', 'Snowflake', 'Analytical data warehousing', 'Medium', 'United States'),
  ('EquiLend', 'Snowflake', 'Market data analytics warehouse', 'Medium', 'United States'),
  ('Deloitte', 'Snowflake', 'Client analytics platform hosting', 'Medium', 'United States'),
  ('ION Group', 'Snowflake', 'Risk analytics data warehouse', 'Medium', 'United States'),
  ('Accenture', 'Microsoft Azure', 'Cloud delivery for consulting platforms', 'Medium', 'United States'),
  ('IBM', 'Microsoft Azure', 'Hybrid cloud managed services', 'Medium', 'United States'),
  ('Deloitte', 'Microsoft Azure', 'Client engagement cloud hosting', 'Medium', 'United States'),
  ('Cisco', 'Microsoft Azure', 'Cloud networking integration', 'Low', 'United States'),
  ('FIS', 'Visa Network', 'Card payment network processing', 'High', 'United States'),
  ('Zellis', 'Visa Network', 'Payroll card disbursement network', 'High', 'United States'),
  ('FIS', 'Mastercard Network', 'Card payment network processing', 'High', 'United States'),
  ('WPA', 'Mastercard Network', 'Benefits card payment network', 'High', 'United States')
) AS s(parent_name, name, service_description, risk_level, country)
JOIN vendors v ON v.name = s.parent_name;

UPDATE fourth_parties SET name = 'AWS' WHERE name = 'AWS (Splunk)';
UPDATE fourth_parties SET name = 'Concur' WHERE name = 'Concur (SAP)';
UPDATE fourth_parties SET name = 'Qualtrics' WHERE name = 'Qualtrics (SAP)';
UPDATE fourth_parties SET name = 'Intel' WHERE name = 'Intel (ServiceNow)';
UPDATE fourth_parties SET name = 'Refinitiv' WHERE name = 'Refinitiv (LSEG)';
UPDATE fourth_parties SET name = 'Red Hat' WHERE name = 'Red Hat (IBM)';
UPDATE fourth_parties SET name = 'HashiCorp' WHERE name = 'HashiCorp (IBM)';
