-- Allow deleting assessments (needed by the Risk Assessments delete button).
-- Without these policies, RLS silently blocks DELETE and the UI appears to do nothing.

CREATE POLICY "Users can delete own assessments"
  ON assessments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anon can delete assessments for demo"
  ON assessments FOR DELETE TO anon
  USING (true);
