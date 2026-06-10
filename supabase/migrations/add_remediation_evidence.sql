ALTER TABLE public.remediations
  ADD COLUMN IF NOT EXISTS evidence TEXT;

UPDATE public.remediations SET evidence = 'Remediation not yet started. No fix actions documented.' WHERE status = 'Open' AND evidence IS NULL;

UPDATE public.remediations SET evidence = 'TLS enabled on 3 of 5 SAP transport routes. Remaining routes in test.' WHERE title = 'Enable SAP Transport Encryption';

UPDATE public.remediations SET evidence = 'Secondary backup region validated. Failover test scheduled next week.' WHERE title = 'Backup Redundancy Assessment';

UPDATE public.remediations SET evidence = 'Key Vault provisioned in production. 60% of application secrets migrated.' WHERE title = 'Azure Key Vault Migration';

UPDATE public.remediations SET evidence = 'All 42 S3 bucket policies reviewed and tightened per least-privilege standard.' WHERE title = 'S3 Bucket Policy Review';

UPDATE public.remediations SET evidence = 'Q1 admin access review completed. Two excess privileged accounts removed.' WHERE title = 'Access Review Completion';

UPDATE public.remediations SET evidence = 'Sub-account IAM roles restricted to least privilege across all environments.' WHERE title = 'Sub-account Security Controls';
