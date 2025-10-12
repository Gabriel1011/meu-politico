-- ============================================
-- MIGRATION 003: Database Functions
-- Descrição: Funções úteis para operações do sistema
-- ============================================

-- ============================================
-- Função: Gerar número de protocolo de ticket
-- ============================================
-- Nota: Usa FOR UPDATE para evitar race conditions
CREATE OR REPLACE FUNCTION generate_ticket_number(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_year TEXT;
  v_number TEXT;
BEGIN
  -- Pegar ano atual
  v_year := EXTRACT(YEAR FROM NOW())::TEXT;

  -- Contar tickets do tenant no ano atual com LOCK para evitar duplicatas
  SELECT COUNT(*) INTO v_count
  FROM tickets
  WHERE tenant_id = p_tenant_id
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
  FOR UPDATE OF tickets;

  -- Gerar número formatado: TP-2025-00001
  v_number := 'TP-' || v_year || '-' || LPAD((v_count + 1)::TEXT, 5, '0');

  RETURN v_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Função: Criar perfil de usuário após signup
-- ============================================
-- Nota: tenant_id deve ser passado no signup via metadata
-- Superadmins devem ser criados manualmente via SQL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_role TEXT;
BEGIN
  -- Pegar tenant_id do metadata (passado no signup)
  IF NEW.raw_user_meta_data ? 'tenant_id' THEN
    v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::UUID;
  END IF;

  -- Verificar se tenant_id é válido
  IF v_tenant_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = v_tenant_id AND ativo = true) THEN
      RAISE EXCEPTION 'Tenant inválido ou inativo: %', v_tenant_id;
    END IF;
  END IF;

  -- Pegar role do metadata (default: cidadao)
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'cidadao');

  -- Validar que apenas cidadão pode ser criado via signup normal
  IF v_role NOT IN ('cidadao', 'assessor') THEN
    RAISE EXCEPTION 'Role % não pode ser criada via signup. Use admin panel.', v_role;
  END IF;

  -- Validar que tenant_id é obrigatório (superadmins são criados manualmente)
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant_id é obrigatório no signup. Passe via metadata: {"tenant_id": "uuid"}';
  END IF;

  -- Inserir usuário com tenant_id
  INSERT INTO public.profile (id, email, nome_completo, tenant_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    v_tenant_id,
    v_role
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debug
    RAISE WARNING 'Erro ao criar perfil para user %: %', NEW.id, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Função: Atualizar status do ticket
-- ============================================
-- Nota: Valida tenant para evitar cross-tenant access
CREATE OR REPLACE FUNCTION update_ticket_status(
  p_ticket_id UUID,
  p_new_status TEXT,
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_old_status TEXT;
  v_ticket_tenant_id UUID;
  v_user_tenant_id UUID;
  v_user_role TEXT;
BEGIN
  -- Buscar tenant e role do usuário
  SELECT tenant_id, role INTO v_user_tenant_id, v_user_role
  FROM profile
  WHERE id = p_user_id;

  -- Verificar se usuário existe
  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Verificar permissão (assessor, político ou superadmin)
  IF v_user_role NOT IN ('assessor', 'politico', 'superadmin') THEN
    RAISE EXCEPTION 'Sem permissão para atualizar tickets';
  END IF;

  -- Buscar status atual e tenant do ticket
  SELECT status, tenant_id INTO v_old_status, v_ticket_tenant_id
  FROM tickets
  WHERE id = p_ticket_id;

  -- Verificar se ticket existe
  IF v_old_status IS NULL THEN
    RAISE EXCEPTION 'Ticket não encontrado';
  END IF;

  -- Validar tenant (superadmin pode acessar qualquer tenant)
  IF v_user_role != 'superadmin' AND v_ticket_tenant_id != v_user_tenant_id THEN
    RAISE EXCEPTION 'Ticket pertence a outro gabinete';
  END IF;

  -- Atualizar ticket
  UPDATE tickets
  SET
    status = p_new_status,
    resolved_at = CASE
      WHEN p_new_status = 'resolvida' AND v_old_status != 'resolvida'
      THEN NOW()
      ELSE resolved_at
    END,
    closed_at = CASE
      WHEN p_new_status IN ('encerrada', 'cancelada') AND v_old_status NOT IN ('encerrada', 'cancelada')
      THEN NOW()
      ELSE closed_at
    END
  WHERE id = p_ticket_id;

  -- Registrar log
  INSERT INTO activity_logs (
    tenant_id,
    user_id,
    acao,
    entidade_tipo,
    entidade_id,
    dados_anteriores,
    dados_novos
  ) VALUES (
    v_ticket_tenant_id,
    p_user_id,
    'ticket.status_changed',
    'ticket',
    p_ticket_id,
    jsonb_build_object('status', v_old_status),
    jsonb_build_object('status', p_new_status)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Função: Obter estatísticas do tenant
-- ============================================
CREATE OR REPLACE FUNCTION get_tenant_stats(p_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_tickets', (
      SELECT COUNT(*) FROM tickets WHERE tenant_id = p_tenant_id
    ),
    'tickets_abertas', (
      SELECT COUNT(*) FROM tickets
      WHERE tenant_id = p_tenant_id
      AND status IN ('nova', 'em_analise', 'em_andamento')
    ),
    'tickets_resolvidas', (
      SELECT COUNT(*) FROM tickets
      WHERE tenant_id = p_tenant_id
      AND status = 'resolvida'
    ),
    'tickets_mes', (
      SELECT COUNT(*) FROM tickets
      WHERE tenant_id = p_tenant_id
      AND created_at >= DATE_TRUNC('month', NOW())
    ),
    'total_cidadaos', (
      SELECT COUNT(*) FROM profile
      WHERE tenant_id = p_tenant_id
      AND role = 'cidadao'
    ),
    'total_categorias', (
      SELECT COUNT(*) FROM categories
      WHERE tenant_id = p_tenant_id
      AND ativa = true
    )
  ) INTO v_stats;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
