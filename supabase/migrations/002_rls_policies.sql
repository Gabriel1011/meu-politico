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
-- Helper Functions (SECURITY DEFINER)
-- ============================================
-- Nota: Estas funções bypassam RLS para evitar recursão infinita
-- Devem ser criadas ANTES das policies que as utilizam

CREATE OR REPLACE FUNCTION public.auth_user_tenant_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT tenant_id FROM public.profile WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profile WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.auth_user_is_staff()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile
    WHERE id = auth.uid()
    AND role IN ('assessor', 'politico')
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_user_is_superadmin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
$$;

-- ============================================
-- TENANTS Policies
-- ============================================

-- Todos podem visualizar tenants ativos (para landing pages públicas)
CREATE POLICY "Anyone can view active tenants"
  ON tenants FOR SELECT
  USING (ativo = true);

-- Superadmins podem visualizar todos os tenants
CREATE POLICY "Superadmins can view all tenants"
  ON tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'superadmin'
    )
  );

-- Políticos podem atualizar seu próprio tenant
CREATE POLICY "Politicos can update own tenant"
  ON tenants FOR UPDATE
  USING (
    id = public.auth_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'politico'
    )
  );

-- Apenas superadmins podem criar/deletar tenants
CREATE POLICY "Superadmins can manage all tenants"
  ON tenants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'superadmin'
    )
  );

-- ============================================
-- PROFILE Policies
-- ============================================

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profile FOR SELECT
  USING (id = auth.uid());

-- Staff pode ver perfis de usuários do mesmo tenant (sem recursão)
CREATE POLICY "Staff can view tenant profiles"
  ON profile FOR SELECT
  USING (
    public.auth_user_is_staff() = true
    AND tenant_id = public.auth_user_tenant_id()
  );

-- Superadmins podem ver todos os perfis
CREATE POLICY "Superadmins can view all profiles"
  ON profile FOR SELECT
  USING (public.auth_user_is_superadmin() = true);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profile FOR UPDATE
  USING (id = auth.uid());

-- Políticos podem gerenciar perfis do seu tenant
CREATE POLICY "Politicos can manage tenant profiles"
  ON profile FOR ALL
  USING (
    tenant_id = public.auth_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profile p
      WHERE p.id = auth.uid()
      AND p.role = 'politico'
    )
  );

-- Superadmins podem gerenciar qualquer perfil
CREATE POLICY "Superadmins can manage all profiles"
  ON profile FOR ALL
  USING (public.auth_user_is_superadmin() = true);

-- ============================================
-- CATEGORIES Policies
-- ============================================

-- Usuários podem ver categorias ativas do seu tenant
CREATE POLICY "Users can view tenant categories"
  ON categories FOR SELECT
  USING (
    ativa = true AND
    tenant_id = public.auth_user_tenant_id()
  );

-- Assessores e políticos podem gerenciar categorias do seu tenant
CREATE POLICY "Staff can manage categories"
  ON categories FOR ALL
  USING (
    tenant_id = public.auth_user_tenant_id()
    AND public.auth_user_is_staff() = true
  );

-- Superadmins podem gerenciar categorias de qualquer tenant
CREATE POLICY "Superadmins can manage all categories"
  ON categories FOR ALL
  USING (public.auth_user_is_superadmin() = true);

-- ============================================
-- TICKETS Policies
-- ============================================

-- Usuários podem ver tickets do seu tenant
CREATE POLICY "Users can view tenant tickets"
  ON tickets FOR SELECT
  USING (tenant_id = public.auth_user_tenant_id());

-- Superadmins podem ver todos os tickets
CREATE POLICY "Superadmins can view all tickets"
  ON tickets FOR SELECT
  USING (public.auth_user_is_superadmin() = true);

-- Usuários podem criar tickets no seu tenant
CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    tenant_id = public.auth_user_tenant_id()
  );

-- Apenas assessores e políticos podem atualizar tickets
CREATE POLICY "Staff can update tickets"
  ON tickets FOR UPDATE
  USING (
    tenant_id = public.auth_user_tenant_id()
    AND public.auth_user_is_staff() = true
  );

-- Superadmins podem atualizar qualquer ticket
CREATE POLICY "Superadmins can update all tickets"
  ON tickets FOR UPDATE
  USING (public.auth_user_is_superadmin() = true);

-- Usuários só podem deletar seus próprios tickets se ainda não estiverem em análise
CREATE POLICY "Users can delete own pending tickets"
  ON tickets FOR DELETE
  USING (
    user_id = auth.uid() AND
    status = 'nova'
  );

-- Superadmins podem deletar qualquer ticket
CREATE POLICY "Superadmins can delete all tickets"
  ON tickets FOR DELETE
  USING (public.auth_user_is_superadmin() = true);

-- ============================================
-- TICKET_COMMENTS Policies
-- ============================================

-- Usuários podem ver comentários públicos + seus comentários privados
CREATE POLICY "Users can view comments"
  ON ticket_comments FOR SELECT
  USING (
    publico = true OR
    autor_id = auth.uid() OR
    public.auth_user_is_staff() = true
  );

-- Superadmins podem ver todos os comentários
CREATE POLICY "Superadmins can view all comments"
  ON ticket_comments FOR SELECT
  USING (public.auth_user_is_superadmin() = true);

-- Usuários podem comentar em tickets do seu tenant
CREATE POLICY "Users can create comments"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    autor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_id
      AND tickets.tenant_id = public.auth_user_tenant_id()
    )
  );

-- Superadmins podem comentar em qualquer ticket
CREATE POLICY "Superadmins can create comments"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    autor_id = auth.uid() AND
    public.auth_user_is_superadmin() = true
  );

-- Apenas o autor pode atualizar seu comentário (nas primeiras 15 minutos)
CREATE POLICY "Authors can update own recent comments"
  ON ticket_comments FOR UPDATE
  USING (
    autor_id = auth.uid() AND
    created_at > NOW() - INTERVAL '15 minutes'
  );

-- Superadmins podem atualizar qualquer comentário
CREATE POLICY "Superadmins can update all comments"
  ON ticket_comments FOR UPDATE
  USING (public.auth_user_is_superadmin() = true);

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
  USING (tenant_id = public.auth_user_tenant_id());

-- Superadmins podem ver todos os eventos
CREATE POLICY "Superadmins can view all events"
  ON events FOR SELECT
  USING (public.auth_user_is_superadmin() = true);

-- Assessores e políticos podem gerenciar eventos do seu tenant
CREATE POLICY "Staff can manage events"
  ON events FOR ALL
  USING (
    tenant_id = public.auth_user_tenant_id()
    AND public.auth_user_is_staff() = true
  );

-- Superadmins podem gerenciar eventos de qualquer tenant
CREATE POLICY "Superadmins can manage all events"
  ON events FOR ALL
  USING (public.auth_user_is_superadmin() = true);

-- ============================================
-- SETTINGS Policies
-- ============================================

-- Políticos podem ver e modificar settings do seu tenant
CREATE POLICY "Politicos can manage settings"
  ON settings FOR ALL
  USING (
    tenant_id = public.auth_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profile
      WHERE id = auth.uid()
      AND role = 'politico'
    )
  );

-- Superadmins podem gerenciar settings de qualquer tenant
CREATE POLICY "Superadmins can manage all settings"
  ON settings FOR ALL
  USING (public.auth_user_is_superadmin() = true);

-- ============================================
-- ACTIVITY_LOGS Policies
-- ============================================

-- Políticos podem ver logs do seu tenant
CREATE POLICY "Politicos can view tenant logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'politico'
      AND profile.tenant_id = activity_logs.tenant_id
    )
  );

-- Superadmins podem ver todos os logs
CREATE POLICY "Superadmins can view all logs"
  ON activity_logs FOR SELECT
  USING (public.auth_user_is_superadmin() = true);

-- Sistema pode inserir logs (via service role ou authenticated users)
CREATE POLICY "System can insert logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);
