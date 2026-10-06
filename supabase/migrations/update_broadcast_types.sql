-- Replace Assessment reminder with Major vulnerability

UPDATE broadcasts
SET broadcast_type = 'Major vulnerability'
WHERE broadcast_type = 'Assessment reminder';

ALTER TABLE broadcasts DROP CONSTRAINT IF EXISTS broadcasts_broadcast_type_check;

ALTER TABLE broadcasts
ADD CONSTRAINT broadcasts_broadcast_type_check
CHECK (broadcast_type IN ('Policy update', 'Major vulnerability', 'Incident notice', 'General'));
