-- Add assigned_to field to tickets table
-- This allows staff members to assign tickets to themselves or other staff

-- Add the column
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profile(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);

-- Add RLS policy for assigned tickets
-- Staff can see who is assigned
-- Citizens can see if their ticket is assigned (but not necessarily who)
CREATE POLICY "Anyone can see assigned_to"
  ON tickets
  FOR SELECT
  USING (true);

-- Only staff can assign tickets
CREATE POLICY "Staff can assign tickets"
  ON tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
        AND profile.tenant_id = tickets.tenant_id
        AND profile.role IN ('assessor', 'vereador', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
        AND profile.tenant_id = tickets.tenant_id
        AND profile.role IN ('assessor', 'vereador', 'admin')
    )
  );

-- Comment
COMMENT ON COLUMN tickets.assigned_to IS 'ID do usuario staff responsavel pela ocorrencia';
