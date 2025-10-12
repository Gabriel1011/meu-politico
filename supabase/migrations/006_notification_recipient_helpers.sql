-- ============================================
-- MIGRATION 006: Notification recipient helpers
-- Descrição: Função utilitária para listar cidadãos de um tenant
-- ============================================

CREATE OR REPLACE FUNCTION public.get_tenant_citizens(p_tenant UUID)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  nome_completo TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, tenant_id, nome_completo
  FROM profile
  WHERE tenant_id = p_tenant
    AND role = 'cidadao';
$$;

REVOKE ALL ON FUNCTION public.get_tenant_citizens(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_tenant_citizens(UUID) TO authenticated;
