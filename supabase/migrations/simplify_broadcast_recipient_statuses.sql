-- Simplify recipient follow-up statuses to Compliant / Not Compliant / Ongoing

ALTER TABLE broadcast_recipients DROP CONSTRAINT IF EXISTS broadcast_recipients_status_check;

UPDATE broadcast_recipients
SET status = CASE status
  WHEN 'Sent' THEN 'Ongoing'
  WHEN 'Acknowledged' THEN 'Ongoing'
  WHEN 'Requires follow-up' THEN 'Ongoing'
  WHEN 'Closed' THEN 'Compliant'
  WHEN 'Compliant' THEN 'Compliant'
  WHEN 'Not compliant' THEN 'Not Compliant'
  WHEN 'Not Compliant' THEN 'Not Compliant'
  WHEN 'Ongoing' THEN 'Ongoing'
  ELSE 'Ongoing'
END;

ALTER TABLE broadcast_recipients
ADD CONSTRAINT broadcast_recipients_status_check
CHECK (status IN ('Compliant', 'Not Compliant', 'Ongoing'));

ALTER TABLE broadcast_recipients ALTER COLUMN status SET DEFAULT 'Ongoing';
