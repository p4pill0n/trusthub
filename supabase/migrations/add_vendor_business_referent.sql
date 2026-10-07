ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS business_referent_name TEXT,
  ADD COLUMN IF NOT EXISTS business_referent_email TEXT;

COMMENT ON COLUMN public.vendors.business_referent_name IS
  'Internal business referent / relationship owner for the vendor';

-- Demo business referents for existing vendors
UPDATE public.vendors SET
  business_referent_name = CASE name
    WHEN 'SAP' THEN 'Claire Moreau'
    WHEN 'AWS' THEN 'James Whitfield'
    WHEN 'Microsoft' THEN 'Priya Shah'
    WHEN 'Salesforce' THEN 'Elena Vargas'
    WHEN 'ServiceNow' THEN 'Tom Bradley'
    WHEN 'Oracle' THEN 'Sophie Laurent'
    WHEN 'IBM' THEN 'Marcus Chen'
    WHEN 'Accenture' THEN 'Amelia Brooks'
    WHEN 'Deloitte' THEN 'Noah Patel'
    WHEN 'Bloomberg' THEN 'Hannah Reid'
    WHEN 'Stripe' THEN 'Lucas Meyer'
    WHEN 'Twilio' THEN 'Olivia Grant'
    WHEN 'Workday' THEN 'Ethan Cole'
    WHEN 'DocuSign' THEN 'Mia Fontaine'
    WHEN 'Zendesk' THEN 'Ryan Cooper'
    WHEN 'CrowdStrike' THEN 'Isabelle Nguyen'
    WHEN 'Splunk' THEN 'Daniel Ortiz'
    ELSE business_referent_name
  END,
  business_referent_email = CASE name
    WHEN 'SAP' THEN 'claire.moreau@bank.example'
    WHEN 'AWS' THEN 'james.whitfield@bank.example'
    WHEN 'Microsoft' THEN 'priya.shah@bank.example'
    WHEN 'Salesforce' THEN 'elena.vargas@bank.example'
    WHEN 'ServiceNow' THEN 'tom.bradley@bank.example'
    WHEN 'Oracle' THEN 'sophie.laurent@bank.example'
    WHEN 'IBM' THEN 'marcus.chen@bank.example'
    WHEN 'Accenture' THEN 'amelia.brooks@bank.example'
    WHEN 'Deloitte' THEN 'noah.patel@bank.example'
    WHEN 'Bloomberg' THEN 'hannah.reid@bank.example'
    WHEN 'Stripe' THEN 'lucas.meyer@bank.example'
    WHEN 'Twilio' THEN 'olivia.grant@bank.example'
    WHEN 'Workday' THEN 'ethan.cole@bank.example'
    WHEN 'DocuSign' THEN 'mia.fontaine@bank.example'
    WHEN 'Zendesk' THEN 'ryan.cooper@bank.example'
    WHEN 'CrowdStrike' THEN 'isabelle.nguyen@bank.example'
    WHEN 'Splunk' THEN 'daniel.ortiz@bank.example'
    ELSE business_referent_email
  END
WHERE business_referent_name IS NULL;
