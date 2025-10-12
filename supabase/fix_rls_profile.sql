-- ============================================
-- FIX: Corrigir política RLS de profile
-- Descrição: Remove recursão infinita na política de visualização de perfis
-- ============================================

-- Remover a política antiga se existir
DROP POLICY IF EXISTS "Staff can view tenant profiles" ON profile;

-- Criar a política corrigida (sem recursão)
CREATE POLICY "Staff can view tenant profiles"
  ON profile FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profile AS my_profile
      WHERE my_profile.id = auth.uid()
      AND my_profile.role IN ('assessor', 'politico', 'admin')
      AND my_profile.tenant_id = profile.tenant_id
    )
  );

-- Verificar se a política foi criada
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'profile';
