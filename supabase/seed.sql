-- Trust Hub Seed Data
-- Run after schema.sql

-- Clear existing data (for re-seeding)
TRUNCATE fourth_parties, remediations, interconnections, bitsight_ratings, security_incidents, assessments, vendors CASCADE;

-- Vendors (20) — entity_name = bank internal entity (France, UK, AMER, ASIA)
INSERT INTO vendors (id, name, entity_name, type, datacontact_name, contact_email, data_type, data_classification, inherent_risk, residual_risk, last_review_date, next_review_date, status) VALUES
('a1000001-0000-4000-8000-000000000002', 'Salesforce', 'France', 'SaaS', 'Hannah Becker', 'hannah.becker@salesforce.com', 'PII', 'C3', 'Very High', 'High', '2026-02-08', '2026-05-24', 'Active'),
('a1000001-0000-4000-8000-000000000003', 'Moody''s Analytics', 'UK', 'Market Data', 'Diego Alvarez', 'diego.alvarez@moodysanalytics.com', 'Financial', 'C3', 'High', 'High', '2026-01-08', '2026-05-09', 'Active'),
('a1000001-0000-4000-8000-000000000004', 'Splunk', 'AMER', 'SaaS', 'Beatrice Romano', 'beatrice.romano@splunk.com', 'PII', 'C2', 'Medium', 'Low', '2025-12-08', '2026-04-24', 'Active'),
('a1000001-0000-4000-8000-000000000005', 'ADP', 'AMER', 'Payroll', 'Priya Sharma', 'priya.sharma@adp.com', 'PII', 'C3', 'Medium', 'Low', '2026-03-25', '2026-06-25', 'Active'),
('a1000001-0000-4000-8000-000000000006', 'Microsoft Azure', 'France', 'Cloud Infrastructure', 'Liam O''Connor', 'liam.o.connor@microsoftazure.com', 'Financial', 'C2', 'Low', 'Low', '2026-04-01', '2026-07-01', 'Active'),
('a1000001-0000-4000-8000-000000000008', 'ServiceNow', 'ASIA', 'SaaS', 'Anders Lindqvist', 'anders.lindqvist@servicenow.com', 'PII', 'C2', 'High', 'High', '2025-11-08', '2026-04-10', 'Active'),
('a1000001-0000-4000-8000-000000000009', 'Workday', 'AMER', 'SaaS', 'Sarah Chen', 'sarah.chen@workday.com', 'PII', 'C3', 'High', 'Medium', '2026-04-20', '2026-07-20', 'Active'),
('a1000001-0000-4000-8000-00000000000a', 'Deloitte', 'UK', 'Consulting', 'James Wilson', 'james.wilson@deloitte.com', 'Financial', 'C2', 'Medium', 'Low', '2026-06-20', '2026-09-20', 'Active'),
('a1000001-0000-4000-8000-00000000000b', 'AWS', 'France', 'Cloud Infrastructure', 'Emma Thompson', 'emma.thompson@aws.amazon.com', 'Financial', 'C3', 'High', 'Medium', '2026-03-15', '2026-06-15', 'Active'),
('a1000001-0000-4000-8000-00000000000c', 'Oracle', 'AMER', 'On-Premise Software', 'Michael Brown', 'michael.brown@oracle.com', 'Financial', 'C3', 'High', 'High', '2025-10-10', '2026-03-26', 'Active'),
('a1000001-0000-4000-8000-00000000000d', 'SAP', 'France', 'SaaS', 'Anna Mueller', 'anna.mueller@sap.com', 'Financial', 'C3', 'Very High', 'High', '2025-09-22', '2026-03-17', 'Active'),
('a1000001-0000-4000-8000-00000000000e', 'DocuSign', 'AMER', 'SaaS', 'Lisa Park', 'lisa.park@docusign.com', 'Legal', 'C2', 'Medium', 'Low', '2026-05-01', '2026-08-01', 'Active'),
('a1000001-0000-4000-8000-00000000000f', 'CrowdStrike', 'AMER', 'SaaS', 'David Kim', 'david.kim@crowdstrike.com', 'PII', 'C2', 'Low', 'Low', '2026-05-15', '2026-08-15', 'Active'),
('a1000001-0000-4000-8000-000000000010', 'Bloomberg', 'UK', 'Market Data', 'Rachel Green', 'rachel.green@bloomberg.net', 'Financial', 'C3', 'High', 'High', '2025-08-18', '2026-02-28', 'Active'),
('a1000001-0000-4000-8000-000000000011', 'Accenture', 'UK', 'Consulting', 'Tom Harris', 'tom.harris@accenture.com', 'PII', 'C2', 'Medium', 'Medium', '2026-07-05', '2026-10-05', 'Active'),
('a1000001-0000-4000-8000-000000000012', 'Snowflake', 'AMER', 'Cloud Infrastructure', 'Nina Patel', 'nina.patel@snowflake.com', 'Financial', 'C3', 'High', 'Medium', '2026-05-28', '2026-08-28', 'Active'),
('a1000001-0000-4000-8000-000000000013', 'Twilio', 'ASIA', 'SaaS', 'Chris Evans', 'chris.evans@twilio.com', 'PII', 'C2', 'Medium', 'Low', '2026-07-20', '2026-10-20', 'Active'),
('a1000001-0000-4000-8000-000000000014', 'IBM', 'AMER', 'Managed Services', 'Patricia Lee', 'patricia.lee@ibm.com', 'Financial', 'C3', 'High', 'High', '2026-06-05', '2026-09-05', 'Active'),
('a1000001-0000-4000-8000-000000000015', 'Zendesk', 'ASIA', 'SaaS', 'Kevin Wright', 'kevin.wright@zendesk.com', 'PII', 'C1', 'Low', 'Low', '2026-08-01', '2026-11-01', 'Active'),
('a1000001-0000-4000-8000-000000000016', 'Stripe', 'AMER', 'SaaS', 'Olivia Martin', 'olivia.martin@stripe.com', 'Financial', 'C3', 'Very High', 'High', '2025-07-12', '2026-02-10', 'Active');

-- Assessments (8 overdue: Salesforce, Moody''s, Splunk, ServiceNow, Oracle, SAP, Bloomberg, Stripe)
INSERT INTO assessments (vendor_id, launched_at, completed_at, status, risk_score, assessor_notes) VALUES
('a1000001-0000-4000-8000-000000000002', '2026-01-15', '2026-02-08', 'Overdue', 78, 'Critical PII processing. Renewal overdue.'),
('a1000001-0000-4000-8000-000000000003', '2026-01-01', '2026-01-08', 'Overdue', 72, 'Financial data provider requires enhanced monitoring.'),
('a1000001-0000-4000-8000-000000000004', '2025-11-20', '2025-12-08', 'Overdue', 45, 'SIEM integration stable. Renewal overdue.'),
('a1000001-0000-4000-8000-000000000005', '2026-01-20', '2026-02-08', 'Completed', 38, 'Payroll data handling compliant.'),
('a1000001-0000-4000-8000-000000000006', '2026-03-15', '2026-04-08', 'Completed', 22, 'Cloud infrastructure well managed.'),
('a1000001-0000-4000-8000-000000000008', '2025-10-20', '2025-11-08', 'Overdue', 68, 'ITSM platform with employee data. Renewal overdue.'),
('a1000001-0000-4000-8000-000000000009', '2026-03-20', '2026-04-15', 'Completed', 55, 'HR data processing adequate controls.'),
('a1000001-0000-4000-8000-00000000000a', '2026-02-25', '2026-03-20', 'Completed', 35, 'Advisory services only.'),
('a1000001-0000-4000-8000-00000000000b', '2026-03-05', '2026-04-01', 'Completed', 58, 'Multi-region cloud deployment.'),
('a1000001-0000-4000-8000-00000000000c', '2025-09-15', '2025-10-10', 'Overdue', 74, 'Legacy database systems need patching review.'),
('a1000001-0000-4000-8000-00000000000d', '2025-08-20', '2025-09-22', 'Overdue', 85, 'ERP system critical to operations.'),
('a1000001-0000-4000-8000-00000000000e', '2026-01-05', '2026-02-28', 'Completed', 32, 'E-signature platform low risk.'),
('a1000001-0000-4000-8000-00000000000f', '2025-12-20', '2026-01-10', 'Completed', 18, 'Security vendor with strong posture.'),
('a1000001-0000-4000-8000-000000000010', '2025-07-25', '2025-08-18', 'Overdue', 70, 'Market data feeds require SOC2 review.'),
('a1000001-0000-4000-8000-000000000011', '2026-02-28', '2026-03-25', 'Completed', 42, 'Transformation consulting engagement.'),
('a1000001-0000-4000-8000-000000000012', '2026-01-20', '2026-02-14', 'Completed', 60, 'Data warehouse platform.'),
('a1000001-0000-4000-8000-000000000013', '2026-02-05', '2026-03-30', 'Completed', 40, 'Communications API provider.'),
('a1000001-0000-4000-8000-000000000014', '2026-01-10', '2026-02-05', 'Completed', 76, 'Managed infrastructure services.'),
('a1000001-0000-4000-8000-000000000015', '2026-02-05', '2026-03-01', 'Completed', 92, 'Customer support platform.'),
('a1000001-0000-4000-8000-000000000016', '2025-06-15', '2025-07-12', 'Overdue', 82, 'Payment processing - PCI DSS required.');

UPDATE assessments SET responses = '{
  "gov-1": "yes", "gov-2": "yes", "gov-3": "yes",
  "acc-1": "yes", "acc-2": "yes", "acc-3": "partial",
  "dat-1": "yes", "dat-2": "yes", "dat-3": "yes",
  "net-1": "yes", "net-2": "yes", "net-3": "partial",
  "app-1": "yes", "app-2": "yes", "app-3": "yes",
  "inc-1": "yes", "inc-2": "yes", "inc-3": "partial",
  "bcp-1": "yes", "bcp-2": "yes", "bcp-3": "yes",
  "tpc-1": "partial", "tpc-2": "yes", "tpc-3": "yes",
  "cmp-1": "yes", "cmp-2": "yes", "cmp-3": "yes",
  "per-1": "yes", "per-2": "yes", "per-3": "partial"
}'::jsonb
WHERE vendor_id = 'a1000001-0000-4000-8000-000000000015' AND status = 'Completed';

-- Security Incidents
INSERT INTO security_incidents (vendor_id, title, description, severity, detected_at, resolved_at, status) VALUES
('a1000001-0000-4000-8000-000000000002', 'Unauthorized API Access Attempt', 'Multiple failed authentication attempts detected on Salesforce API integration endpoint.', 'High', '2026-04-15 08:30:00+00', '2026-04-16 14:00:00+00', 'Resolved'),
('a1000001-0000-4000-8000-00000000000b', 'S3 Bucket Misconfiguration', 'Public read access detected on non-production S3 bucket.', 'Medium', '2026-03-10 11:00:00+00', '2026-03-11 09:30:00+00', 'Resolved'),
('a1000001-0000-4000-8000-00000000000c', 'Oracle Patch Delay', 'Critical security patch not applied within SLA timeframe.', 'High', '2026-02-28 16:45:00+00', '2026-03-05 10:00:00+00', 'Resolved'),
('a1000001-0000-4000-8000-00000000000d', 'SAP Transport Security Issue', 'Unencrypted transport detected for sensitive financial data.', 'Critical', '2026-05-01 07:20:00+00', NULL, 'Open'),
('a1000001-0000-4000-8000-000000000010', 'Bloomberg Terminal Breach Notification', 'Vendor notified of potential credential compromise affecting terminal access.', 'High', '2026-04-22 13:00:00+00', NULL, 'Open'),
('a1000001-0000-4000-8000-000000000013', 'Twilio SMS Phishing Campaign', 'Phishing messages sent via compromised Twilio sub-account.', 'Medium', '2026-01-18 09:00:00+00', '2026-01-20 17:00:00+00', 'Resolved'),
('a1000001-0000-4000-8000-000000000016', 'Stripe Webhook Validation Failure', 'Webhook signature validation failures indicating potential tampering.', 'Low', '2026-05-28 04:30:00+00', '2026-05-28 12:00:00+00', 'Resolved'),
('a1000001-0000-4000-8000-000000000004', 'Splunk Log Injection', 'Suspicious log entries detected that may indicate log injection attack.', 'Medium', '2026-05-15 19:45:00+00', NULL, 'Open'),
('a1000001-0000-4000-8000-000000000014', 'IBM Managed Service Outage', 'Extended outage affecting backup systems during ransomware event at IBM datacenter.', 'Critical', '2026-03-25 03:00:00+00', '2026-04-02 18:00:00+00', 'Resolved');

-- BitSight Ratings
INSERT INTO bitsight_ratings (vendor_id, score, rating, fetched_at) VALUES
('a1000001-0000-4000-8000-000000000002', 620, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000003', 710, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000004', 690, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000005', 740, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000006', 810, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000008', 650, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000009', 670, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000000a', 760, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000000b', 790, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000000c', 540, 'Basic', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000000d', 510, 'Basic', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000000e', 720, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000000f', 850, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000010', 630, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000011', 700, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000012', 680, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000013', 660, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000014', 560, 'Basic', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000015', 730, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000016', 590, 'Intermediate', '2026-06-01 00:00:00+00');

-- Interconnections
INSERT INTO interconnections (vendor_id, direction, connection_type, description) VALUES
('a1000001-0000-4000-8000-000000000002', 'Bidirectional', 'API', 'CRM data sync for customer onboarding workflows'),
('a1000001-0000-4000-8000-000000000005', 'Outbound', 'SFTP', 'Daily payroll file transfer to ADP processing center'),
('a1000001-0000-4000-8000-000000000006', 'Bidirectional', 'API', 'Cloud infrastructure provisioning and monitoring'),
('a1000001-0000-4000-8000-000000000008', 'Inbound', 'Portal', 'IT service management portal for internal users'),
('a1000001-0000-4000-8000-000000000009', 'Outbound', 'API', 'HR data integration for employee records'),
('a1000001-0000-4000-8000-00000000000b', 'Bidirectional', 'API', 'Cloud services API for compute and storage'),
('a1000001-0000-4000-8000-00000000000c', 'Inbound', 'VPN', 'On-premise Oracle database access via VPN tunnel'),
('a1000001-0000-4000-8000-00000000000d', 'Bidirectional', 'API', 'ERP financial data exchange'),
('a1000001-0000-4000-8000-00000000000e', 'Outbound', 'API', 'Document signing workflow integration'),
('a1000001-0000-4000-8000-000000000010', 'Inbound', 'API', 'Real-time market data feeds'),
('a1000001-0000-4000-8000-000000000012', 'Bidirectional', 'API', 'Data warehouse ETL pipelines'),
('a1000001-0000-4000-8000-000000000013', 'Outbound', 'API', 'SMS and email notification services'),
('a1000001-0000-4000-8000-000000000016', 'Bidirectional', 'API', 'Payment processing and webhook notifications'),
('a1000001-0000-4000-8000-000000000004', 'Inbound', 'API', 'Security event log ingestion for SIEM'),
('a1000001-0000-4000-8000-00000000000f', 'Inbound', 'API', 'Endpoint detection and response telemetry'),
('a1000001-0000-4000-8000-000000000003', 'Inbound', 'SFTP', 'Credit rating data file delivery'),
('a1000001-0000-4000-8000-000000000014', 'Bidirectional', 'VPN', 'Managed infrastructure remote administration'),
('a1000001-0000-4000-8000-000000000015', 'Outbound', 'API', 'Customer support ticket integration');

-- Remediations
INSERT INTO remediations (vendor_id, assessment_id, title, description, priority, status, due_date, owner, evidence) VALUES
('a1000001-0000-4000-8000-000000000002', NULL, 'Implement MFA for API Access', 'Require multi-factor authentication for all Salesforce API integrations.', 'Critical', 'Open', '2026-07-15', 'Sarah Mitchell', 'Remediation not yet started. Vendor kick-off scheduled.'),
('a1000001-0000-4000-8000-00000000000c', NULL, 'Apply Critical Oracle Patches', 'Ensure all critical security patches are applied within 30-day SLA.', 'High', 'Open', '2026-07-01', 'Michael Brown', 'Remediation not yet started. Awaiting vendor patch window.'),
('a1000001-0000-4000-8000-00000000000d', NULL, 'Enable SAP Transport Encryption', 'Configure TLS encryption for all SAP transport connections.', 'Critical', 'In Progress', '2026-06-20', 'Anna Mueller', 'TLS enabled on 3 of 5 SAP transport routes. Remaining routes in test.'),
('a1000001-0000-4000-8000-000000000016', NULL, 'PCI DSS Re-certification', 'Complete annual PCI DSS compliance re-certification.', 'High', 'Open', '2026-08-01', 'Olivia Martin', 'Remediation not yet started. Scoping call booked with vendor.'),
('a1000001-0000-4000-8000-00000000000b', NULL, 'S3 Bucket Policy Review', 'Conduct quarterly review of all S3 bucket access policies.', 'Medium', 'Closed', '2026-04-30', 'Emma Thompson', 'All 42 S3 bucket policies reviewed and tightened per least-privilege standard.'),
('a1000001-0000-4000-8000-000000000010', NULL, 'Credential Rotation Program', 'Implement automated credential rotation for Bloomberg terminals.', 'High', 'Open', '2026-07-20', 'Rachel Green', 'Remediation not yet started. No fix actions documented.'),
('a1000001-0000-4000-8000-000000000014', NULL, 'Backup Redundancy Assessment', 'Evaluate backup redundancy following recent outage incident.', 'High', 'In Progress', '2026-07-10', 'Patricia Lee', 'Secondary backup region validated. Failover test scheduled next week.'),
('a1000001-0000-4000-8000-000000000004', NULL, 'Log Integrity Monitoring', 'Deploy log integrity monitoring to detect injection attacks.', 'Medium', 'Open', '2026-08-15', 'Beatrice Romano', 'Remediation not yet started. Monitoring tool shortlist under review.'),
('a1000001-0000-4000-8000-000000000008', NULL, 'Access Review Completion', 'Complete quarterly access review for ServiceNow admin accounts.', 'Medium', 'Closed', '2026-05-31', 'Anders Lindqvist', 'Q1 admin access review completed. Two excess privileged accounts removed.'),
('a1000001-0000-4000-8000-000000000009', NULL, 'HR Data Minimization', 'Review and minimize HR data fields shared with Workday.', 'Low', 'Open', '2026-09-01', 'Sarah Chen', 'Remediation not yet started. Data mapping exercise pending.'),
('a1000001-0000-4000-8000-000000000013', NULL, 'Sub-account Security Controls', 'Implement enhanced security controls for Twilio sub-accounts.', 'Medium', 'Closed', '2026-03-01', 'Chris Evans', 'Sub-account IAM roles restricted to least privilege across all environments.'),
('a1000001-0000-4000-8000-000000000006', NULL, 'Azure Key Vault Migration', 'Migrate secrets from config files to Azure Key Vault.', 'Low', 'In Progress', '2026-08-30', 'Liam O''Connor', 'Key Vault provisioned in production. 60% of application secrets migrated.');

-- Fourth Parties
INSERT INTO fourth_parties (parent_vendor_id, name, service_description, risk_level, country) VALUES
('a1000001-0000-4000-8000-000000000002', 'Heroku (Salesforce)', 'PaaS hosting for custom Salesforce apps', 'Medium', 'United States'),
('a1000001-0000-4000-8000-000000000002', 'MuleSoft', 'Enterprise integration platform', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000006', 'Akamai', 'CDN and DDoS protection services', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000006', 'Cloudflare', 'DNS and edge security services', 'Low', 'United States'),
('a1000001-0000-4000-8000-00000000000b', 'Datadog', 'Cloud monitoring and observability', 'Low', 'United States'),
('a1000001-0000-4000-8000-00000000000b', 'PagerDuty', 'Incident management and alerting', 'Low', 'United States'),
('a1000001-0000-4000-8000-00000000000d', 'Concur (SAP)', 'Travel and expense management', 'Medium', 'United States'),
('a1000001-0000-4000-8000-00000000000d', 'Qualtrics (SAP)', 'Experience management platform', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000008', 'Intel (ServiceNow)', 'Hardware infrastructure provider', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000012', 'AWS (Snowflake)', 'Underlying cloud infrastructure', 'Medium', 'United States'),
('a1000001-0000-4000-8000-000000000012', 'Azure (Snowflake)', 'Secondary cloud infrastructure', 'Medium', 'United States'),
('a1000001-0000-4000-8000-000000000016', 'Visa Network', 'Card payment network processing', 'High', 'United States'),
('a1000001-0000-4000-8000-000000000016', 'Mastercard Network', 'Card payment network processing', 'High', 'United States'),
('a1000001-0000-4000-8000-000000000010', 'Refinitiv (LSEG)', 'Financial data analytics subsidiary', 'Medium', 'United Kingdom'),
('a1000001-0000-4000-8000-000000000014', 'Red Hat (IBM)', 'Enterprise Linux and middleware', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000014', 'HashiCorp (IBM)', 'Infrastructure automation tools', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000005', 'Cognizant (ADP)', 'IT services subcontractor', 'Medium', 'India'),
('a1000001-0000-4000-8000-000000000004', 'AWS (Splunk)', 'Cloud hosting for Splunk deployment', 'Low', 'United States');
