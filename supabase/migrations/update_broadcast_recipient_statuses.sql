-- Align broadcast recipient statuses with product wording

ALTER TABLE broadcast_recipients DROP CONSTRAINT IF EXISTS broadcast_recipients_status_check;

UPDATE broadcast_recipients
SET status = CASE status
  WHEN 'Pending' THEN 'Sent'
  WHEN 'Follow-up needed' THEN 'Requires follow-up'
  ELSE status
END;

ALTER TABLE broadcast_recipients
ADD CONSTRAINT broadcast_recipients_status_check
CHECK (status IN ('Sent', 'Acknowledged', 'Compliant', 'Requires follow-up', 'Not compliant', 'Closed'));
