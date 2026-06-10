-- Sample questionnaire responses for Zendesk (completed assessment demo)
UPDATE public.assessments
SET
  responses = '{
    "gov-1": "yes",
    "gov-2": "yes",
    "gov-3": "yes",
    "acc-1": "yes",
    "acc-2": "yes",
    "acc-3": "partial",
    "dat-1": "yes",
    "dat-2": "yes",
    "dat-3": "yes",
    "net-1": "yes",
    "net-2": "yes",
    "net-3": "partial",
    "app-1": "yes",
    "app-2": "yes",
    "app-3": "yes",
    "inc-1": "yes",
    "inc-2": "yes",
    "inc-3": "partial",
    "bcp-1": "yes",
    "bcp-2": "yes",
    "bcp-3": "yes",
    "tpc-1": "partial",
    "tpc-2": "yes",
    "tpc-3": "yes",
    "cmp-1": "yes",
    "cmp-2": "yes",
    "cmp-3": "yes",
    "per-1": "yes",
    "per-2": "yes",
    "per-3": "partial"
  }'::jsonb,
  risk_score = 92
WHERE vendor_id = 'a1000001-0000-4000-8000-000000000015'
  AND status = 'Completed';
