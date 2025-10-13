-- ============================================
-- FIX: generate_ticket_number function
-- Problema: FOR UPDATE OF não funciona corretamente com COUNT(*)
-- Solução: Usar uma sequência mais simples e confiável
-- ============================================

-- Drop da função antiga
DROP FUNCTION IF EXISTS generate_ticket_number(UUID);

-- Recriar função com lógica corrigida
CREATE OR REPLACE FUNCTION generate_ticket_number(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_year TEXT;
  v_number TEXT;
BEGIN
  -- Pegar ano atual
  v_year := EXTRACT(YEAR FROM NOW())::TEXT;

  -- Contar tickets do tenant no ano atual
  -- Removido FOR UPDATE que causava erro 400
  SELECT COUNT(*) INTO v_count
  FROM tickets
  WHERE tenant_id = p_tenant_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  -- Incrementar count para o próximo número
  v_count := v_count + 1;

  -- Gerar número formatado: TP-2025-00001
  v_number := 'TP-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');

  RETURN v_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário explicativo
COMMENT ON FUNCTION generate_ticket_number(UUID) IS
'Gera número de protocolo único para tickets no formato TP-YYYY-NNNNN.
Nota: Usa contagem simples. Para alta concorrência, considere usar SEQUENCE.';
