-- Allow deleting broadcast campaigns (recipients cascade via FK)

CREATE POLICY "Users can delete broadcasts"
  ON broadcasts FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anon can delete broadcasts for demo"
  ON broadcasts FOR DELETE TO anon USING (true);

CREATE POLICY "Users can delete broadcast_recipients"
  ON broadcast_recipients FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anon can delete broadcast_recipients for demo"
  ON broadcast_recipients FOR DELETE TO anon USING (true);
