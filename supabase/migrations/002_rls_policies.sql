-- ============================================
-- MIGRATION 002: Row Level Security Policies
-- Descrição: Implementa RLS para isolamento de dados por tenant
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TENANTS Policies
-- ============================================

-- Todos podem visualizar tenants ativos (para landing pages públicas)
CREATE POLICY "Anyone can view active tenants"
  ON tenants FOR SELECT
  USING (ativo = true);

-- Apenas admins podem modificar tenants
CREATE POLICY "Admins can modify tenants"
  ON tenants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'admin'
    )
  );

-- ============================================
-- PROFILE Policies
-- ============================================

-- Função helper para evitar recursão no RLS
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profile WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profile FOR SELECT
  USING (id = auth.uid());

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profile FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- CATEGORIES Policies
-- ============================================

-- Usuários podem ver categorias ativas do seu tenant
CREATE POLICY "Users can view tenant categories"
  ON categories FOR SELECT
  USING (
    ativa = true AND
    tenant_id = public.get_user_tenant_id()
  );

-- Assessores e políticos podem gerenciar categorias
CREATE POLICY "Staff can manage categories"
  ON categories FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profile
      WHERE id = auth.uid()
      AND role IN ('assessor', 'politico', 'admin')
    )
  );

-- ============================================
-- TICKETS Policies
-- ============================================

-- Usuários podem ver tickets do seu tenant
CREATE POLICY "Users can view tenant tickets"
  ON tickets FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

-- Usuários podem criar tickets no seu tenant
CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    tenant_id = public.get_user_tenant_id()
  );

-- Apenas assessores e políticos podem atualizar tickets
CREATE POLICY "Staff can update tickets"
  ON tickets FOR UPDATE
  USING (
    tenant_id = public.get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profile
      WHERE id = auth.uid()
      AND role IN ('assessor', 'politico', 'admin')
    )
  );

-- Usuários só podem deletar seus próprios tickets se ainda não estiverem em análise
CREATE POLICY "Users can delete own pending tickets"
  ON tickets FOR DELETE
  USING (
    user_id = auth.uid() AND
    status = 'nova'
  );

-- ============================================
-- TICKET_COMMENTS Policies
-- ============================================

-- Usuários podem ver comentários públicos + seus comentários privados
CREATE POLICY "Users can view comments"
  ON ticket_comments FOR SELECT
  USING (
    publico = true OR
    autor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
      AND profile.role IN ('assessor', 'politico', 'admin')
      AND profile.tenant_id = public.get_user_tenant_id()
    )
  );

-- Usuários podem comentar em tickets do seu tenant
CREATE POLICY "Users can create comments"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    autor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_id
      AND tickets.tenant_id = public.get_user_tenant_id()
    )
  );

-- Apenas o autor pode atualizar seu comentário (nas primeiras 15 minutos)
CREATE POLICY "Authors can update own recent comments"
  ON ticket_comments FOR UPDATE
  USING (
    autor_id = auth.uid() AND
    created_at > NOW() - INTERVAL '15 minutes'
  );

-- ============================================
-- EVENTS Policies
-- ============================================

-- Qualquer um pode ver eventos públicos
CREATE POLICY "Anyone can view public events"
  ON events FOR SELECT
  USING (publico = true);

-- Usuários autenticados podem ver todos eventos do seu tenant
CREATE POLICY "Users can view tenant events"
  ON events FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

-- Assessores e políticos podem gerenciar eventos
CREATE POLICY "Staff can manage events"
  ON events FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profile
      WHERE id = auth.uid()
      AND role IN ('assessor', 'politico', 'admin')
    )
  );

-- ============================================
-- SETTINGS Policies
-- ============================================

-- Políticos podem ver e modificar settings do seu tenant
CREATE POLICY "Politicos can manage settings"
  ON settings FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profile
      WHERE id = auth.uid()
      AND role IN ('politico', 'admin')
    )
  );

-- ============================================
-- ACTIVITY_LOGS Policies
-- ============================================

-- Apenas admins e políticos podem ver logs
CREATE POLICY "Admins can view logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
      AND profile.role IN ('politico', 'admin')
      AND (profile.tenant_id = activity_logs.tenant_id OR profile.role = 'admin')
    )
  );

-- Sistema pode inserir logs (via service role)
CREATE POLICY "System can insert logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);
