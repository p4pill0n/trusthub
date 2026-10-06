-- Trust Hub Seed Data
-- Run after schema.sql

-- Clear existing data (for re-seeding)
TRUNCATE fourth_parties, remediations, interconnections, bitsight_ratings, security_incidents, assessments, vendors CASCADE;

-- Vendors (27) — entity_name = bank internal entity (France, UK, AMER, ASIA)
INSERT INTO vendors (id, name, entity_name, type, datacontact_name, contact_email, data_type, data_classification, inherent_risk, residual_risk, last_review_date, next_review_date, status) VALUES
('a1000001-0000-4000-8000-000000000004', 'Splunk', 'AMER', 'SaaS', 'Beatrice Romano', 'beatrice.romano@splunk.com', 'PII', 'C2', 'Medium', 'Low', '2023-12-01', '2026-12-01', 'Active'),
('a1000001-0000-4000-8000-000000000008', 'ServiceNow', 'ASIA', 'SaaS', 'Anders Lindqvist', 'anders.lindqvist@servicenow.com', 'PII', 'C2', 'High', 'High', '2024-10-15', '2026-10-15', 'Active'),
('a1000001-0000-4000-8000-000000000009', 'Workday', 'AMER', 'SaaS', 'Sarah Chen', 'sarah.chen@workday.com', 'PII', 'C3', 'High', 'Medium', '2024-12-05', '2026-12-05', 'Active'),
('a1000001-0000-4000-8000-00000000000a', 'Deloitte', 'UK', 'Consulting', 'James Wilson', 'james.wilson@deloitte.com', 'Financial', 'C2', 'Medium', 'Low', '2025-01-20', '2028-01-20', 'Active'),
('a1000001-0000-4000-8000-00000000000b', 'AWS', 'France', 'Cloud Infrastructure', 'Emma Thompson', 'emma.thompson@aws.amazon.com', 'Financial', 'C3', 'High', 'Medium', '2024-11-20', '2026-11-20', 'Active'),
('a1000001-0000-4000-8000-00000000000c', 'Oracle', 'AMER', 'On-Premise Software', 'Michael Brown', 'michael.brown@oracle.com', 'Financial', 'C3', 'High', 'High', '2024-08-20', '2026-08-20', 'Active'),
('a1000001-0000-4000-8000-00000000000d', 'SAP', 'France', 'SaaS', 'Anna Mueller', 'anna.mueller@sap.com', 'Financial', 'C3', 'Very High', 'High', '2025-08-10', '2026-08-10', 'Active'),
('a1000001-0000-4000-8000-00000000000e', 'DocuSign', 'AMER', 'SaaS', 'Lisa Park', 'lisa.park@docusign.com', 'Legal', 'C2', 'Medium', 'Low', '2024-08-01', '2027-08-01', 'Active'),
('a1000001-0000-4000-8000-00000000000f', 'CrowdStrike', 'AMER', 'SaaS', 'David Kim', 'david.kim@crowdstrike.com', 'PII', 'C2', 'Low', 'Low', '2024-09-15', '2027-09-15', 'Active'),
('a1000001-0000-4000-8000-000000000010', 'Bloomberg', 'UK', 'Market Data', 'Rachel Green', 'rachel.green@bloomberg.net', 'Financial', 'C3', 'High', 'High', '2024-07-15', '2026-07-15', 'Active'),
('a1000001-0000-4000-8000-000000000011', 'Accenture', 'UK', 'Consulting', 'Tom Harris', 'tom.harris@accenture.com', 'PII', 'C2', 'Medium', 'Medium', '2025-02-05', '2028-02-05', 'Active'),
('a1000001-0000-4000-8000-000000000013', 'Twilio', 'ASIA', 'SaaS', 'Chris Evans', 'chris.evans@twilio.com', 'PII', 'C2', 'Medium', 'Low', '2025-03-20', '2028-03-20', 'Active'),
('a1000001-0000-4000-8000-000000000014', 'IBM', 'AMER', 'Managed Services', 'Patricia Lee', 'patricia.lee@ibm.com', 'Financial', 'C3', 'High', 'High', '2024-12-28', '2026-12-28', 'Active'),
('a1000001-0000-4000-8000-000000000015', 'Zendesk', 'ASIA', 'SaaS', 'Kevin Wright', 'kevin.wright@zendesk.com', 'PII', 'C1', 'Low', 'Low', '2025-04-01', '2028-04-01', 'Active'),
('a1000001-0000-4000-8000-000000000016', 'Stripe', 'AMER', 'SaaS', 'Olivia Martin', 'olivia.martin@stripe.com', 'Financial', 'C3', 'Very High', 'High', '2025-06-15', '2026-06-15', 'Active'),
('a1000001-0000-4000-8000-000000000017', 'BCD Travel', 'AMER', 'Managed Services', 'Claire Dubois', 'claire.dubois@bcdtravel.com', 'PII', 'C2', 'Medium', 'Low', '2024-05-10', '2027-05-10', 'Active'),
('a1000001-0000-4000-8000-000000000018', 'Cisco', 'France', 'On-Premise Software', 'Mark Jensen', 'mark.jensen@cisco.com', 'PII', 'C2', 'High', 'Medium', '2024-10-20', '2026-10-20', 'Active'),
('a1000001-0000-4000-8000-000000000019', 'COLT', 'UK', 'Managed Services', 'Sophie Turner', 'sophie.turner@colt.net', 'Financial', 'C2', 'Medium', 'Low', '2023-12-30', '2026-12-30', 'Active'),
('a1000001-0000-4000-8000-00000000001a', 'EquiLend', 'AMER', 'Market Data', 'Ryan Cooper', 'ryan.cooper@equilend.com', 'Financial', 'C3', 'High', 'High', '2024-11-01', '2026-11-01', 'Active'),
('a1000001-0000-4000-8000-00000000001b', 'Fidessa', 'UK', 'On-Premise Software', 'Helen Grant', 'helen.grant@fidessa.com', 'Financial', 'C3', 'High', 'Medium', '2024-10-25', '2026-10-25', 'Active'),
('a1000001-0000-4000-8000-00000000001c', 'FIS', 'AMER', 'SaaS', 'Brian Walsh', 'brian.walsh@fisglobal.com', 'Financial', 'C3', 'Very High', 'High', '2025-08-28', '2026-08-28', 'Active'),
('a1000001-0000-4000-8000-00000000001d', 'ION Group', 'UK', 'Market Data', 'Laura Bennett', 'laura.bennett@iongroup.com', 'Financial', 'C3', 'High', 'High', '2024-12-15', '2026-12-15', 'Active'),
('a1000001-0000-4000-8000-00000000001e', 'Microsoft', 'France', 'Cloud Infrastructure', 'Alexandre Petit', 'alexandre.petit@microsoft.com', 'PII', 'C2', 'Medium', 'Low', '2024-10-20', '2027-10-20', 'Active'),
('a1000001-0000-4000-8000-00000000001f', 'Murex', 'France', 'On-Premise Software', 'Camille Roux', 'camille.roux@murex.com', 'Financial', 'C3', 'Very High', 'High', '2025-07-20', '2026-07-20', 'Active'),
('a1000001-0000-4000-8000-000000000020', 'TOPdesk', 'ASIA', 'SaaS', 'Jonas Vermeer', 'jonas.vermeer@topdesk.com', 'PII', 'C1', 'Low', 'Low', '2024-11-12', '2027-11-12', 'Active'),
('a1000001-0000-4000-8000-000000000021', 'WPA', 'UK', 'Managed Services', 'Emily Hughes', 'emily.hughes@wpa.org.uk', 'PII', 'C3', 'Medium', 'Medium', '2024-06-22', '2027-06-22', 'Active'),
('a1000001-0000-4000-8000-000000000022', 'Zellis', 'UK', 'Payroll', 'Daniel Price', 'daniel.price@zellis.com', 'PII', 'C3', 'High', 'Medium', '2024-10-28', '2026-10-28', 'Active');

-- Assessments (overdue reviews driven by vendor next_review_date vs policy cadence)
INSERT INTO assessments (vendor_id, launched_at, completed_at, status, risk_score, assessor_notes) VALUES
('a1000001-0000-4000-8000-000000000004', '2025-11-20', '2025-12-08', 'Completed', 45, 'SIEM integration stable.'),
('a1000001-0000-4000-8000-000000000008', '2025-10-20', '2025-11-08', 'Completed', 68, 'ITSM platform with employee data.'),
('a1000001-0000-4000-8000-000000000009', '2026-03-20', '2026-04-15', 'Completed', 55, 'HR data processing adequate controls.'),
('a1000001-0000-4000-8000-00000000000a', '2026-02-25', '2026-03-20', 'Completed', 35, 'Advisory services only.'),
('a1000001-0000-4000-8000-00000000000b', '2026-03-05', '2026-04-01', 'Completed', 58, 'Multi-region cloud deployment.'),
('a1000001-0000-4000-8000-00000000000c', '2025-09-15', '2025-10-10', 'Completed', 74, 'Legacy database systems need patching review.'),
('a1000001-0000-4000-8000-00000000000d', '2025-08-20', '2025-09-22', 'Overdue', 85, 'ERP system critical to operations. Renewal overdue.'),
('a1000001-0000-4000-8000-00000000000e', '2026-01-05', '2026-02-28', 'Completed', 32, 'E-signature platform low risk.'),
('a1000001-0000-4000-8000-00000000000f', '2025-12-20', '2026-01-10', 'Completed', 18, 'Security vendor with strong posture.'),
('a1000001-0000-4000-8000-000000000010', '2025-07-25', '2025-08-18', 'Completed', 70, 'Market data feeds require SOC2 review.'),
('a1000001-0000-4000-8000-000000000011', '2026-02-28', '2026-03-25', 'Completed', 42, 'Transformation consulting engagement.'),
('a1000001-0000-4000-8000-000000000013', '2026-02-05', '2026-03-30', 'Completed', 40, 'Communications API provider.'),
('a1000001-0000-4000-8000-000000000014', '2026-01-10', '2026-02-05', 'Completed', 76, 'Managed infrastructure services.'),
('a1000001-0000-4000-8000-000000000015', '2026-02-05', '2026-03-01', 'Completed', 92, 'Customer support platform.'),
('a1000001-0000-4000-8000-000000000016', '2025-06-15', '2025-07-12', 'Overdue', 82, 'Payment processing - PCI DSS required. Renewal overdue.');

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
('a1000001-0000-4000-8000-00000000000b', 'S3 Bucket Misconfiguration', 'Public read access detected on non-production S3 bucket.', 'Medium', '2026-03-10 11:00:00+00', '2026-03-11 09:30:00+00', 'Resolved'),
('a1000001-0000-4000-8000-00000000000c', 'Oracle Patch Delay', 'Critical security patch not applied within SLA timeframe.', 'High', '2026-02-28 16:45:00+00', '2026-03-05 10:00:00+00', 'Resolved'),
('a1000001-0000-4000-8000-00000000000d', 'SAP Transport Security Issue', 'Unencrypted transport detected for sensitive financial data.', 'Critical', '2026-05-01 07:20:00+00', NULL, 'Open'),
('a1000001-0000-4000-8000-000000000010', 'Bloomberg Terminal Breach Notification', 'Vendor notified of potential credential compromise affecting terminal access.', 'High', '2026-04-22 13:00:00+00', NULL, 'Open'),
('a1000001-0000-4000-8000-000000000013', 'Twilio SMS Phishing Campaign', 'Phishing messages sent via compromised Twilio sub-account.', 'Medium', '2026-01-18 09:00:00+00', '2026-01-20 17:00:00+00', 'Resolved'),
('a1000001-0000-4000-8000-000000000016', 'Stripe Webhook Validation Failure', 'Webhook signature validation failures indicating potential tampering.', 'Low', '2026-05-28 04:30:00+00', '2026-05-28 12:00:00+00', 'Resolved'),
('a1000001-0000-4000-8000-000000000004', 'Splunk Log Injection', 'Suspicious log entries detected that may indicate log injection attack.', 'Medium', '2026-05-15 19:45:00+00', NULL, 'Open'),
('a1000001-0000-4000-8000-000000000014', 'IBM Managed Service Outage', 'Extended outage affecting backup systems during ransomware event at IBM datacenter.', 'Critical', '2026-03-25 03:00:00+00', '2026-04-02 18:00:00+00', 'Resolved');

-- BitSight Ratings (all active vendors)
INSERT INTO bitsight_ratings (vendor_id, score, rating, fetched_at) VALUES
('a1000001-0000-4000-8000-000000000004', 690, 'Intermediate', '2026-06-01 00:00:00+00'),
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
('a1000001-0000-4000-8000-000000000013', 660, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000014', 560, 'Basic', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000015', 730, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000016', 590, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000017', 680, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000018', 710, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000019', 640, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000001a', 620, 'Basic', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000001b', 600, 'Basic', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000001c', 580, 'Basic', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000001d', 655, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000001e', 780, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-00000000001f', 545, 'Basic', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000020', 715, 'Advanced', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000021', 675, 'Intermediate', '2026-06-01 00:00:00+00'),
('a1000001-0000-4000-8000-000000000022', 635, 'Intermediate', '2026-06-01 00:00:00+00');

-- Interconnections (all active vendors)
INSERT INTO interconnections (vendor_id, direction, connection_type, description) VALUES
('a1000001-0000-4000-8000-000000000008', 'Inbound', 'Portal', 'IT service management portal for internal users'),
('a1000001-0000-4000-8000-000000000009', 'Outbound', 'API', 'HR data integration for employee records'),
('a1000001-0000-4000-8000-00000000000b', 'Bidirectional', 'API', 'Cloud services API for compute and storage'),
('a1000001-0000-4000-8000-00000000000c', 'Inbound', 'VPN', 'On-premise Oracle database access via VPN tunnel'),
('a1000001-0000-4000-8000-00000000000d', 'Bidirectional', 'API', 'ERP financial data exchange'),
('a1000001-0000-4000-8000-00000000000e', 'Outbound', 'API', 'Document signing workflow integration'),
('a1000001-0000-4000-8000-000000000010', 'Inbound', 'API', 'Real-time market data feeds'),
('a1000001-0000-4000-8000-000000000013', 'Outbound', 'API', 'SMS and email notification services'),
('a1000001-0000-4000-8000-000000000016', 'Bidirectional', 'API', 'Payment processing and webhook notifications'),
('a1000001-0000-4000-8000-000000000004', 'Inbound', 'API', 'Security event log ingestion for SIEM'),
('a1000001-0000-4000-8000-00000000000f', 'Inbound', 'API', 'Endpoint detection and response telemetry'),
('a1000001-0000-4000-8000-000000000014', 'Bidirectional', 'VPN', 'Managed infrastructure remote administration'),
('a1000001-0000-4000-8000-000000000015', 'Outbound', 'API', 'Customer support ticket integration'),
('a1000001-0000-4000-8000-000000000011', 'Outbound', 'Portal', 'Consulting engagement delivery portal'),
('a1000001-0000-4000-8000-000000000017', 'Bidirectional', 'API', 'Corporate travel booking and expense feeds'),
('a1000001-0000-4000-8000-000000000018', 'Inbound', 'VPN', 'Network device management and telemetry'),
('a1000001-0000-4000-8000-000000000019', 'Bidirectional', 'Direct Link', 'Dedicated network connectivity services'),
('a1000001-0000-4000-8000-00000000000a', 'Outbound', 'Portal', 'Advisory project collaboration workspace'),
('a1000001-0000-4000-8000-00000000001a', 'Inbound', 'API', 'Securities lending market data and trade feeds'),
('a1000001-0000-4000-8000-00000000001b', 'Bidirectional', 'API', 'Trading desk order and market connectivity'),
('a1000001-0000-4000-8000-00000000001c', 'Bidirectional', 'SFTP', 'Core banking batch file exchange'),
('a1000001-0000-4000-8000-00000000001d', 'Inbound', 'API', 'Trading and risk analytics data feeds'),
('a1000001-0000-4000-8000-00000000001e', 'Bidirectional', 'API', 'Microsoft 365 and Azure identity integration'),
('a1000001-0000-4000-8000-00000000001f', 'Inbound', 'VPN', 'Trading platform remote administration'),
('a1000001-0000-4000-8000-000000000020', 'Outbound', 'API', 'IT service desk ticket synchronization'),
('a1000001-0000-4000-8000-000000000021', 'Outbound', 'SFTP', 'Payroll and benefits data transfer'),
('a1000001-0000-4000-8000-000000000022', 'Bidirectional', 'API', 'HR and payroll system integration');

-- Remediations
INSERT INTO remediations (vendor_id, assessment_id, title, description, priority, status, due_date, owner, evidence) VALUES
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
('a1000001-0000-4000-8000-00000000001e', NULL, 'Enforce Conditional Access Policies', 'Require MFA and device compliance for all Azure AD privileged roles.', 'High', 'In Progress', '2026-11-15', 'Alexandre Petit', 'Conditional access drafted for admin roles. Broader rollout pending UAT.'),
('a1000001-0000-4000-8000-00000000001e', NULL, 'Review Guest User Access', 'Remove stale guest accounts from Teams and SharePoint workspaces.', 'Medium', 'Open', '2026-12-01', 'Alexandre Petit', 'Remediation not yet started. Guest inventory export scheduled.'),
('a1000001-0000-4000-8000-00000000001f', NULL, 'Harden Trading Platform Access', 'Restrict VPN admin access and enable session recording for Murex support accounts.', 'Critical', 'Open', '2026-10-30', 'Camille Roux', 'Remediation not yet started. Vendor change window requested for Q4.'),
('a1000001-0000-4000-8000-000000000018', NULL, 'Disable Unused Network Services', 'Turn off unused management protocols on edge devices and enforce AAA logging.', 'High', 'In Progress', '2026-11-20', 'Mark Jensen', 'AAA logging enabled on 60% of devices. Remaining sites scheduled next weekend.'),
('a1000001-0000-4000-8000-000000000018', NULL, 'Firmware Currency Review', 'Bring all firewall and switch firmware to approved baseline versions.', 'Medium', 'Open', '2026-12-15', 'Mark Jensen', 'Remediation not yet started. Baseline matrix under review with network ops.'),
('a1000001-0000-4000-8000-00000000001c', NULL, 'Encrypt Batch File Transfers', 'Migrate remaining cleartext SFTP drops to TLS 1.2+ with key-based auth.', 'Critical', 'Open', '2026-11-05', 'Brian Walsh', 'Remediation not yet started. Coordination with FIS ops team in progress.'),
('a1000001-0000-4000-8000-00000000001b', NULL, 'Segregate Trading Environments', 'Separate production and UAT Fidessa connectivity with dedicated credentials.', 'High', 'In Progress', '2026-11-28', 'Helen Grant', 'UAT credentials rotated. Production segregation design approved.'),
('a1000001-0000-4000-8000-00000000001a', NULL, 'API Key Rotation', 'Rotate EquiLend API keys and store secrets in the enterprise vault.', 'Medium', 'Closed', '2026-09-15', 'Ryan Cooper', 'All API keys rotated and vaulted. Old keys revoked as of 2026-09-12.'),
('a1000001-0000-4000-8000-00000000001d', NULL, 'Limit Market Data Entitlements', 'Review and reduce excess market data entitlements on ION feeds.', 'Medium', 'Open', '2026-12-10', 'Laura Bennett', 'Remediation not yet started. Entitlement report requested from vendor.'),
('a1000001-0000-4000-8000-000000000011', NULL, 'NDA and Data Handling Refresh', 'Update Accenture engagement NDAs to current bank data classification standards.', 'Low', 'In Progress', '2026-11-30', 'Tom Harris', 'Legal redlines exchanged. Awaiting Accenture countersignature.'),
('a1000001-0000-4000-8000-00000000000a', NULL, 'Secure File Exchange Only', 'Mandate use of approved secure file exchange; retire ad-hoc email attachments.', 'Medium', 'Open', '2026-11-18', 'James Wilson', 'Remediation not yet started. Comms draft prepared for engagement leads.'),
('a1000001-0000-4000-8000-000000000017', NULL, 'PII Minimization in Bookings', 'Remove unnecessary traveler PII fields from booking API payloads.', 'Medium', 'Open', '2026-12-05', 'Claire Dubois', 'Remediation not yet started. Data mapping with BCD product team booked.'),
('a1000001-0000-4000-8000-000000000019', NULL, 'Circuit Access Control Audit', 'Audit who can request and approve network circuit changes.', 'High', 'In Progress', '2026-11-12', 'Sophie Turner', 'Access list received from COLT. Internal owner sign-off outstanding for 4 accounts.'),
('a1000001-0000-4000-8000-00000000000f', NULL, 'EDR Coverage Gaps', 'Deploy Falcon sensors to remaining unmanaged endpoints in ASIA region.', 'High', 'In Progress', '2026-10-25', 'David Kim', 'ASIA rollout at 78%. Remaining servers blocked on change freeze.'),
('a1000001-0000-4000-8000-00000000000e', NULL, 'Envelope Retention Policy', 'Align DocuSign retention with bank records schedule and purge expired envelopes.', 'Low', 'Closed', '2026-08-20', 'Lisa Park', 'Retention policy configured and verified. Purge job completed 2026-08-18.'),
('a1000001-0000-4000-8000-000000000015', NULL, 'Admin Role Recertification', 'Quarterly recertification of Zendesk admin and light-agent roles.', 'Medium', 'Open', '2026-11-08', 'Kevin Wright', 'Remediation not yet started. Recertification campaign queued in IAM tool.'),
('a1000001-0000-4000-8000-000000000020', NULL, 'SSO Enforcement', 'Disable local password login; require SSO for all TOPdesk operators.', 'High', 'Open', '2026-11-22', 'Jonas Vermeer', 'Remediation not yet started. IdP connector test planned for next sprint.'),
('a1000001-0000-4000-8000-000000000021', NULL, 'Encrypt Benefits Data at Rest', 'Confirm encryption at rest for all benefits member data stores.', 'High', 'In Progress', '2026-12-08', 'Emily Hughes', 'Vendor attestation received. Independent crypto validation scheduled.'),
('a1000001-0000-4000-8000-000000000022', NULL, 'Privileged Access Review', 'Review Zellis privileged accounts used for payroll file submissions.', 'Medium', 'Open', '2026-11-25', 'Daniel Price', 'Remediation not yet started. Account inventory requested from vendor.'),
('a1000001-0000-4000-8000-000000000008', NULL, 'Production Change Freeze Controls', 'Strengthen emergency change approvals for production ServiceNow updates.', 'Medium', 'Closed', '2026-09-30', 'Anders Lindqvist', 'Emergency change CAB rules updated and communicated to platform team.'),
('a1000001-0000-4000-8000-000000000009', NULL, 'Field-Level Encryption for SSN', 'Enable field-level encryption for national ID fields in Workday.', 'Critical', 'In Progress', '2026-12-20', 'Sarah Chen', 'Pilot enabled in sandbox. Production cutover targeted for December.'),
('a1000001-0000-4000-8000-000000000010', NULL, 'Terminal Screen Capture Controls', 'Disable unauthorized screen capture on Bloomberg terminals where feasible.', 'Medium', 'Open', '2026-12-12', 'Rachel Green', 'Remediation not yet started. Feasibility note requested from Bloomberg support.'),
('a1000001-0000-4000-8000-00000000000d', NULL, 'Privileged Role Recertification', 'Recertify SAP_ALL and similar powerful roles across production clients.', 'High', 'Open', '2026-11-10', 'Anna Mueller', 'Remediation not yet started. Role extract generated; owners assigned.');

-- Fourth Parties (some shared across parents to drive occurrence ranking)
INSERT INTO fourth_parties (parent_vendor_id, name, service_description, risk_level, country) VALUES
-- Datadog
('a1000001-0000-4000-8000-00000000000b', 'Datadog', 'Cloud monitoring and observability', 'Low', 'United States'),
('a1000001-0000-4000-8000-00000000001e', 'Datadog', 'Cloud monitoring and observability', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000008', 'Datadog', 'Platform performance monitoring', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000004', 'Datadog', 'Infrastructure metrics alongside SIEM', 'Low', 'United States'),
('a1000001-0000-4000-8000-00000000000f', 'Datadog', 'Endpoint telemetry observability', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000015', 'Datadog', 'SaaS application monitoring', 'Low', 'United States'),
-- AWS
('a1000001-0000-4000-8000-000000000004', 'AWS', 'Cloud hosting for Splunk deployment', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000009', 'AWS', 'Cloud hosting for HR workloads', 'Medium', 'United States'),
('a1000001-0000-4000-8000-00000000000c', 'AWS', 'Hybrid cloud hosting for ERP components', 'Medium', 'United States'),
('a1000001-0000-4000-8000-00000000001f', 'AWS', 'Cloud hosting for trading platform components', 'Medium', 'United States'),
('a1000001-0000-4000-8000-00000000001b', 'AWS', 'Cloud hosting for trading connectivity', 'Medium', 'United States'),
('a1000001-0000-4000-8000-000000000020', 'AWS', 'SaaS hosting infrastructure', 'Low', 'United States'),
-- PagerDuty
('a1000001-0000-4000-8000-00000000000b', 'PagerDuty', 'Incident management and alerting', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000008', 'PagerDuty', 'Incident management and alerting', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000004', 'PagerDuty', 'SIEM-triggered on-call alerting', 'Low', 'United States'),
('a1000001-0000-4000-8000-00000000000f', 'PagerDuty', 'Security incident paging', 'Medium', 'United States'),
('a1000001-0000-4000-8000-00000000001e', 'PagerDuty', 'Cloud operations alerting', 'Low', 'United States'),
-- Cloudflare
('a1000001-0000-4000-8000-000000000013', 'Cloudflare', 'CDN and edge security', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000015', 'Cloudflare', 'CDN and DDoS protection', 'Low', 'United States'),
('a1000001-0000-4000-8000-00000000000e', 'Cloudflare', 'Edge delivery and WAF', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000011', 'Cloudflare', 'Client portal edge security', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000019', 'Cloudflare', 'Network edge acceleration', 'Low', 'United States'),
-- Snowflake
('a1000001-0000-4000-8000-000000000010', 'Snowflake', 'Analytical data warehousing', 'Medium', 'United States'),
('a1000001-0000-4000-8000-00000000001a', 'Snowflake', 'Market data analytics warehouse', 'Medium', 'United States'),
('a1000001-0000-4000-8000-00000000000a', 'Snowflake', 'Client analytics platform hosting', 'Medium', 'United States'),
('a1000001-0000-4000-8000-00000000001d', 'Snowflake', 'Risk analytics data warehouse', 'Medium', 'United States'),
-- Microsoft Azure
('a1000001-0000-4000-8000-000000000011', 'Microsoft Azure', 'Cloud delivery for consulting platforms', 'Medium', 'United States'),
('a1000001-0000-4000-8000-000000000014', 'Microsoft Azure', 'Hybrid cloud managed services', 'Medium', 'United States'),
('a1000001-0000-4000-8000-00000000000a', 'Microsoft Azure', 'Client engagement cloud hosting', 'Medium', 'United States'),
('a1000001-0000-4000-8000-000000000018', 'Microsoft Azure', 'Cloud networking integration', 'Low', 'United States'),
-- Payment networks
('a1000001-0000-4000-8000-000000000016', 'Visa Network', 'Card payment network processing', 'High', 'United States'),
('a1000001-0000-4000-8000-00000000001c', 'Visa Network', 'Card payment network processing', 'High', 'United States'),
('a1000001-0000-4000-8000-000000000022', 'Visa Network', 'Payroll card disbursement network', 'High', 'United States'),
('a1000001-0000-4000-8000-000000000016', 'Mastercard Network', 'Card payment network processing', 'High', 'United States'),
('a1000001-0000-4000-8000-00000000001c', 'Mastercard Network', 'Card payment network processing', 'High', 'United States'),
('a1000001-0000-4000-8000-000000000021', 'Mastercard Network', 'Benefits card payment network', 'High', 'United States'),
-- Single-parent fourth parties
('a1000001-0000-4000-8000-00000000000d', 'Concur', 'Travel and expense management', 'Medium', 'United States'),
('a1000001-0000-4000-8000-00000000000d', 'Qualtrics', 'Experience management platform', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000008', 'Intel', 'Hardware infrastructure provider', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000010', 'Refinitiv', 'Financial data analytics subsidiary', 'Medium', 'United Kingdom'),
('a1000001-0000-4000-8000-000000000014', 'Red Hat', 'Enterprise Linux and middleware', 'Low', 'United States'),
('a1000001-0000-4000-8000-000000000014', 'HashiCorp', 'Infrastructure automation tools', 'Low', 'United States');
