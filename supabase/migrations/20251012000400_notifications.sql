-- ============================================
-- MIGRATION 004: Notifications
-- Descrição: Cria tabela de notificações com RLS por usuário
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  destinatario_id UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  tipo TEXT DEFAULT 'geral',
  metadados JSONB DEFAULT '{}'::jsonb,
  lido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_destinatario ON notifications(destinatario_id, created_at DESC);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_lido_em ON notifications(lido_em);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados leem somente suas notificações
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (destinatario_id = auth.uid());

-- Usuários podem marcar suas notificações como lidas/não lidas
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (destinatario_id = auth.uid())
  WITH CHECK (destinatario_id = auth.uid());

-- Staff pode criar notificações para o tenant em que está
CREATE POLICY "notifications_insert_staff"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = public.get_my_tenant_id()
    AND public.is_staff() = true
  );

-- Superadmins têm acesso total
CREATE POLICY "notifications_manage_superadmin"
  ON notifications FOR ALL
  TO authenticated
  USING (public.is_superadmin() = true)
  WITH CHECK (public.is_superadmin() = true);

-- Service role mantém acesso irrestrito para tarefas administrativas
CREATE POLICY "notifications_service_role_all"
  ON notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
