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
-- IMPORTANTE: Estas funções bypassam RLS do profile
-- SECURITY DEFINER faz a função rodar com privilégios do owner (postgres)
-- Isso permite ler profile sem triggerar as policies de profile

CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT tenant_id FROM profile WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profile WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role IN ('assessor', 'politico') FROM profile WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'superadmin' FROM profile WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

-- ============================================
-- PROFILE Policies
-- ============================================
-- REGRA ANTI-RECURSÃO: Policies de profile NÃO podem usar funções helper
-- nem fazer SELECT em profile (causaria loop infinito)

-- Usuários veem apenas seu próprio perfil
CREATE POLICY "profile_select_own"
  ON profile FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "profile_update_own"
  ON profile FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service role tem acesso total (para migrations, funções SECURITY DEFINER)
CREATE POLICY "profile_service_role_all"
  ON profile FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TENANTS Policies
-- ============================================

-- Todos podem ver tenants ativos (landing pages públicas)
CREATE POLICY "tenants_select_public"
  ON tenants FOR SELECT
  USING (ativo = true);

-- Superadmins podem ver todos os tenants
CREATE POLICY "tenants_select_superadmin"
  ON tenants FOR SELECT
  USING (public.is_superadmin() = true);

-- Políticos podem atualizar seu próprio tenant
CREATE POLICY "tenants_update_politico"
  ON tenants FOR UPDATE
  USING (
    id = public.get_my_tenant_id()
    AND public.get_my_role() = 'politico'
  );

-- Apenas superadmins podem criar/deletar tenants
CREATE POLICY "tenants_insert_superadmin"
  ON tenants FOR INSERT
  WITH CHECK (public.is_superadmin() = true);

CREATE POLICY "tenants_delete_superadmin"
  ON tenants FOR DELETE
  USING (public.is_superadmin() = true);

-- ============================================
-- CATEGORIES Policies
-- ============================================

-- Usuários veem categorias ativas do seu tenant
CREATE POLICY "categories_select_tenant"
  ON categories FOR SELECT
  USING (
    ativa = true
    AND tenant_id = public.get_my_tenant_id()
  );

-- Superadmins veem todas as categorias
CREATE POLICY "categories_select_superadmin"
  ON categories FOR SELECT
  USING (public.is_superadmin() = true);

-- Staff pode gerenciar categorias do seu tenant
CREATE POLICY "categories_all_staff"
  ON categories FOR ALL
  USING (
    tenant_id = public.get_my_tenant_id()
    AND public.is_staff() = true
  );

-- Superadmins podem gerenciar categorias de qualquer tenant
CREATE POLICY "categories_all_superadmin"
  ON categories FOR ALL
  USING (public.is_superadmin() = true);

-- ============================================
-- TICKETS Policies
-- ============================================

-- Usuários veem tickets do seu tenant
CREATE POLICY "tickets_select_tenant"
  ON tickets FOR SELECT
  USING (tenant_id = public.get_my_tenant_id());

-- Superadmins veem todos os tickets
CREATE POLICY "tickets_select_superadmin"
  ON tickets FOR SELECT
  USING (public.is_superadmin() = true);

-- Usuários podem criar tickets no seu tenant
CREATE POLICY "tickets_insert_user"
  ON tickets FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id = public.get_my_tenant_id()
  );

-- Staff pode atualizar tickets do seu tenant
CREATE POLICY "tickets_update_staff"
  ON tickets FOR UPDATE
  USING (
    tenant_id = public.get_my_tenant_id()
    AND public.is_staff() = true
  );

-- Superadmins podem atualizar qualquer ticket
CREATE POLICY "tickets_update_superadmin"
  ON tickets FOR UPDATE
  USING (public.is_superadmin() = true);

-- Usuários podem deletar seus próprios tickets se ainda não estiverem em análise
CREATE POLICY "tickets_delete_own"
  ON tickets FOR DELETE
  USING (
    user_id = auth.uid()
    AND status = 'nova'
  );

-- Superadmins podem deletar qualquer ticket
CREATE POLICY "tickets_delete_superadmin"
  ON tickets FOR DELETE
  USING (public.is_superadmin() = true);

-- ============================================
-- TICKET_COMMENTS Policies
-- ============================================

-- Usuários veem comentários públicos OU seus próprios OU se forem staff
CREATE POLICY "comments_select_user"
  ON ticket_comments FOR SELECT
  USING (
    publico = true
    OR autor_id = auth.uid()
    OR public.is_staff() = true
  );

-- Superadmins veem todos os comentários
CREATE POLICY "comments_select_superadmin"
  ON ticket_comments FOR SELECT
  USING (public.is_superadmin() = true);

-- Usuários podem comentar em tickets do seu tenant
CREATE POLICY "comments_insert_user"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    autor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_id
      AND tickets.tenant_id = public.get_my_tenant_id()
    )
  );

-- Superadmins podem comentar em qualquer ticket
CREATE POLICY "comments_insert_superadmin"
  ON ticket_comments FOR INSERT
  WITH CHECK (public.is_superadmin() = true);

-- Apenas o autor pode atualizar seu comentário (nas primeiras 15 minutos)
CREATE POLICY "comments_update_author"
  ON ticket_comments FOR UPDATE
  USING (
    autor_id = auth.uid()
    AND created_at > NOW() - INTERVAL '15 minutes'
  );

-- Superadmins podem atualizar qualquer comentário
CREATE POLICY "comments_update_superadmin"
  ON ticket_comments FOR UPDATE
  USING (public.is_superadmin() = true);

-- ============================================
-- EVENTS Policies
-- ============================================

-- Qualquer um pode ver eventos públicos
CREATE POLICY "events_select_public"
  ON events FOR SELECT
  USING (publico = true);

-- Usuários autenticados veem eventos do seu tenant
CREATE POLICY "events_select_tenant"
  ON events FOR SELECT
  USING (tenant_id = public.get_my_tenant_id());

-- Superadmins veem todos os eventos
CREATE POLICY "events_select_superadmin"
  ON events FOR SELECT
  USING (public.is_superadmin() = true);

-- Staff pode gerenciar eventos do seu tenant
CREATE POLICY "events_all_staff"
  ON events FOR ALL
  USING (
    tenant_id = public.get_my_tenant_id()
    AND public.is_staff() = true
  );

-- Superadmins podem gerenciar eventos de qualquer tenant
CREATE POLICY "events_all_superadmin"
  ON events FOR ALL
  USING (public.is_superadmin() = true);

-- ============================================
-- SETTINGS Policies
-- ============================================

-- Políticos podem gerenciar settings do seu tenant
CREATE POLICY "settings_all_politico"
  ON settings FOR ALL
  USING (
    tenant_id = public.get_my_tenant_id()
    AND public.get_my_role() = 'politico'
  );

-- Superadmins podem gerenciar settings de qualquer tenant
CREATE POLICY "settings_all_superadmin"
  ON settings FOR ALL
  USING (public.is_superadmin() = true);

-- ============================================
-- ACTIVITY_LOGS Policies
-- ============================================

-- Políticos podem ver logs do seu tenant
CREATE POLICY "logs_select_politico"
  ON activity_logs FOR SELECT
  USING (
    tenant_id = public.get_my_tenant_id()
    AND public.get_my_role() = 'politico'
  );

-- Superadmins podem ver todos os logs
CREATE POLICY "logs_select_superadmin"
  ON activity_logs FOR SELECT
  USING (public.is_superadmin() = true);

-- Sistema pode inserir logs
CREATE POLICY "logs_insert_system"
  ON activity_logs FOR INSERT
  WITH CHECK (true);
