-- ============================================
-- MIGRATION 004: Notifications
-- Description: Creates notifications table with RLS per user
-- ============================================

-- Drop existing table if it exists (for migration from Portuguese to English column names)
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'general',
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can only read their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

-- Users can mark their notifications as read/unread
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Staff can create notifications for their tenant
CREATE POLICY "notifications_insert_staff"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = public.get_my_tenant_id()
    AND public.is_staff() = true
  );

-- Superadmins have full access
CREATE POLICY "notifications_manage_superadmin"
  ON notifications FOR ALL
  TO authenticated
  USING (public.is_superadmin() = true)
  WITH CHECK (public.is_superadmin() = true);

-- Service role maintains unrestricted access for administrative tasks
CREATE POLICY "notifications_service_role_all"
  ON notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
