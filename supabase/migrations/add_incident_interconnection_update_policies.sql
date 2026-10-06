-- Allow demo anon updates for editable incidents and interconnections tables

CREATE POLICY "Anon can update security_incidents for demo"
  ON security_incidents FOR UPDATE TO anon USING (true);

CREATE POLICY "Anon can update interconnections for demo"
  ON interconnections FOR UPDATE TO anon USING (true);
