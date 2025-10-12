# 📊 Análise Profunda das Migrations - Meu Político

**Data:** 2025-01-12
**Status:** Análise Completa

---

## 🎯 Resumo Executivo

### ✅ Pontos Positivos
- Estrutura multi-tenant bem definida
- RLS implementado em todas as tabelas
- Funções helper com SECURITY DEFINER evitando recursão
- Triggers de updated_at consistentes
- Seed com dados de teste completos

### ⚠️ Problemas Críticos Encontrados
1. **Segurança**: Policy de admin pode modificar qualquer tenant
2. **Segurança**: Função `update_ticket_status` não valida tenant
3. **Race Condition**: `generate_ticket_number` pode gerar duplicatas
4. **Cascata Destrutiva**: DELETE de profile apaga todos os tickets

---

## 📝 Análise Detalhada por Migration

### MIGRATION 000 - Extensions ✅
**Status:** OK
**Arquivos:** `000_extensions.sql`

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**Análise:**
- ✅ Extensões necessárias carregadas antes de tudo
- ✅ IF NOT EXISTS previne erros em re-execução
- ✅ Nenhum problema encontrado

---

### MIGRATION 001 - Schema ⚠️
**Status:** REQUER ATENÇÃO
**Arquivos:** `001_initial_schema.sql`

#### Problemas Encontrados:

#### 1. ❌ CRÍTICO: Foreign Key Destrutiva em Tickets
**Localização:** Linha 75
```sql
user_id UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE
```

**Problema:** Se um perfil de usuário for deletado, TODOS os tickets dele são deletados também.

**Impacto:**
- Perda de histórico de ocorrências
- Quebra de auditoria
- Dados irrecuperáveis

**Recomendação:**
```sql
user_id UUID NOT NULL REFERENCES profile(id) ON DELETE RESTRICT
-- Ou, se quiser permitir deleção:
user_id UUID REFERENCES profile(id) ON DELETE SET NULL
-- E alterar para: user_id UUID NULL
```

**Justificativa:** Em uma plataforma de gestão pública, é ESSENCIAL manter histórico. Tickets devem existir independente do usuário.

---

#### 2. ⚠️ ATENÇÃO: Foreign Key em Events sem ON DELETE
**Localização:** Linha 136
```sql
criador_id UUID NOT NULL REFERENCES profile(id)
```

**Problema:** Comportamento padrão é RESTRICT, mas não está explícito.

**Recomendação:**
```sql
criador_id UUID REFERENCES profile(id) ON DELETE SET NULL
-- E alterar para: criador_id UUID NULL
```

**Justificativa:** Eventos públicos devem permanecer mesmo se criador sair.

---

#### 3. ℹ️ INFO: Campo metadata não usado
**Localização:** Várias tabelas
```sql
metadata JSONB DEFAULT '{}'::jsonb
```

**Análise:** Campo existe mas não é usado no código atual.

**Recomendação:**
- Manter para futura extensibilidade
- Documentar uso pretendido
- Ou remover se não houver plano de uso

---

### MIGRATION 002 - RLS Policies 🔒
**Status:** REQUER CORREÇÕES CRÍTICAS
**Arquivos:** `002_rls_policies.sql`

#### Problemas Encontrados:

#### 1. ❌ CRÍTICO: Admin Global vs Admin por Tenant
**Localização:** Linhas 26-34
```sql
CREATE POLICY "Admins can modify tenants"
  ON tenants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'admin'
    )
  );
```

**Problema:** Qualquer admin pode modificar QUALQUER tenant, quebrando isolamento multi-tenant.

**Cenário de Falha:**
1. Gabinete A tem um admin
2. Gabinete B tem um admin
3. Admin do Gabinete A pode modificar dados do Gabinete B ❌

**Recomendação:**
```sql
-- Opção 1: Admin só modifica seu próprio tenant
CREATE POLICY "Admins can modify own tenant"
  ON tenants FOR UPDATE
  USING (
    id = public.auth_user_tenant_id()
    AND public.auth_user_is_staff() = true
  );

-- Opção 2: Criar role 'superadmin' para operações cross-tenant
CREATE POLICY "Superadmins can modify any tenant"
  ON tenants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profile
      WHERE id = auth.uid()
      AND role = 'superadmin'
    )
  );
```

---

#### 2. ⚠️ INCONSISTÊNCIA: Política de Settings
**Localização:** Linhas 196-205
```sql
CREATE POLICY "Politicos can manage settings"
  ON settings FOR ALL
  USING (
    tenant_id = public.auth_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profile
      WHERE id = auth.uid()
      AND role IN ('politico', 'admin')
    )
  );
```

**Problema:** Usa `EXISTS` direto ao invés de função helper `auth_user_is_staff()`.

**Recomendação:**
```sql
CREATE POLICY "Politicos can manage settings"
  ON settings FOR ALL
  USING (
    tenant_id = public.auth_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profile
      WHERE id = auth.uid()
      AND role IN ('politico', 'admin')
    )
  );
-- Nota: Settings são específicos de político, então não usar auth_user_is_staff() está OK
-- MAS deveria ter uma função auth_user_is_politico() para consistência
```

---

#### 3. ❌ MISSING: Política INSERT para Profile
**Problema:** Não existe política que permita INSERT em profile.

**Impacto:**
- Depende 100% do trigger `on_auth_user_created`
- Não é possível criar perfis manualmente via SQL
- Não é possível migrar dados de outro sistema

**Recomendação:**
```sql
-- Permitir service_role criar profiles (para migrations/admin)
CREATE POLICY "Service role can insert profiles"
  ON profile FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
  );

-- Ou permitir admins criarem profiles no seu tenant
CREATE POLICY "Admins can create tenant profiles"
  ON profile FOR INSERT
  WITH CHECK (
    tenant_id = public.auth_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profile
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

---

### MIGRATION 003 - Functions ⚡
**Status:** REQUER CORREÇÕES DE SEGURANÇA
**Arquivos:** `003_functions.sql`

#### Problemas Encontrados:

#### 1. ❌ CRÍTICO: Race Condition em generate_ticket_number
**Localização:** Linhas 9-30
```sql
SELECT COUNT(*) INTO v_count
FROM tickets
WHERE tenant_id = p_tenant_id
AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

v_number := 'TP-' || v_year || '-' || LPAD((v_count + 1)::TEXT, 5, '0');
```

**Problema:** Dois tickets criados simultaneamente podem receber o mesmo número.

**Cenário de Falha:**
```
Thread A: COUNT() = 5 → próximo = 6 → TP-2025-00006
Thread B: COUNT() = 5 → próximo = 6 → TP-2025-00006  ❌ DUPLICADO
```

**Recomendação:**
```sql
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

CREATE OR REPLACE FUNCTION generate_ticket_number(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_number INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::TEXT;

  -- Usar sequence com LOCK
  SELECT COUNT(*) + 1 INTO v_number
  FROM tickets
  WHERE tenant_id = p_tenant_id
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
  FOR UPDATE;  -- LOCK para evitar race condition

  RETURN 'TP-' || v_year || '-' || LPAD(v_number::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### 2. ❌ CRÍTICO: Vulnerabilidade de Segurança em update_ticket_status
**Localização:** Linhas 87-146
```sql
CREATE OR REPLACE FUNCTION update_ticket_status(
  p_ticket_id UUID,
  p_new_status TEXT,
  p_user_id UUID
)
```

**Problema:** Verifica se usuário é staff, mas NÃO verifica se o ticket pertence ao mesmo tenant do usuário.

**Cenário de Ataque:**
```
1. User A é assessor do Tenant 1
2. User A chama update_ticket_status() com ticket_id do Tenant 2
3. Função PERMITE a atualização ❌
4. User A modificou ticket de outro gabinete
```

**Recomendação:**
```sql
CREATE OR REPLACE FUNCTION update_ticket_status(
  p_ticket_id UUID,
  p_new_status TEXT,
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_old_status TEXT;
  v_tenant_id UUID;
  v_user_tenant_id UUID;
BEGIN
  -- Buscar tenant do usuário
  SELECT tenant_id INTO v_user_tenant_id
  FROM profile
  WHERE id = p_user_id;

  -- Verificar permissão (assessor ou político) E MESMO TENANT
  IF NOT EXISTS (
    SELECT 1 FROM profile
    WHERE id = p_user_id
    AND role IN ('assessor', 'politico', 'admin')
  ) THEN
    RAISE EXCEPTION 'Sem permissão para atualizar tickets';
  END IF;

  -- Buscar status atual E tenant do ticket
  SELECT status, tenant_id INTO v_old_status, v_tenant_id
  FROM tickets
  WHERE id = p_ticket_id;

  -- ✅ VALIDAR TENANT
  IF v_tenant_id != v_user_tenant_id THEN
    RAISE EXCEPTION 'Ticket pertence a outro gabinete';
  END IF;

  -- Resto da função...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### 3. ⚠️ LÓGICA DE NEGÓCIO: handle_new_user fallback
**Localização:** Linhas 46-52
```sql
-- Fallback: pegar primeiro tenant ativo
IF v_tenant_id IS NULL THEN
  SELECT id INTO v_tenant_id
  FROM public.tenants
  WHERE ativo = true
  ORDER BY created_at ASC
  LIMIT 1;
END IF;
```

**Problema:** Em produção multi-tenant, usuário sem tenant_id não deveria ser criado em tenant aleatório.

**Recomendação:**
```sql
-- Remover fallback em produção
IF v_tenant_id IS NULL THEN
  RAISE EXCEPTION 'tenant_id obrigatório no signup. Use metadata: {"tenant_id": "uuid"}';
END IF;
```

---

### SEED DATA 🌱
**Status:** OK COM RESSALVAS
**Arquivos:** `seed.sql`

#### Análise:

#### 1. ✅ OK: Estrutura geral
- Tenant criado corretamente
- 10 categorias com cores e ícones
- 3 usuários com roles diferentes
- 3 tickets de exemplo
- ON CONFLICT DO UPDATE garante dados corretos

#### 2. ⚠️ ATENÇÃO: Senhas em código
**Localização:** Linha 59
```sql
crypt('Demo123!', gen_salt('bf'))
```

**Recomendação:** Adicionar comentário explícito:
```sql
-- ⚠️ ATENÇÃO: APENAS PARA DESENVOLVIMENTO
-- NÃO usar em produção. Senhas reais devem vir de signup form.
crypt('Demo123!', gen_salt('bf'))
```

#### 3. ✅ OK: ON CONFLICT strategy
```sql
ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  role = EXCLUDED.role,
  ...
```
Garante que roles corretos sejam aplicados mesmo se trigger criar perfil primeiro.

---

## 🔧 Correções Recomendadas por Prioridade

### 🔴 CRÍTICO (Implementar Imediatamente)

1. **Corrigir `update_ticket_status` para validar tenant**
   - Impacto: Segurança
   - Risco: Alto (cross-tenant access)

2. **Corrigir política de admin em tenants**
   - Impacto: Isolamento multi-tenant
   - Risco: Alto (data leak)

3. **Adicionar FOR UPDATE em `generate_ticket_number`**
   - Impacto: Integridade de dados
   - Risco: Médio (duplicatas ocasionais)

### 🟡 IMPORTANTE (Implementar em breve)

4. **Mudar ON DELETE CASCADE para RESTRICT em tickets**
   - Impacto: Preservação de histórico
   - Risco: Médio (perda de dados acidental)

5. **Adicionar política INSERT para profile**
   - Impacto: Flexibilidade
   - Risco: Baixo (workaround existe)

### 🟢 MELHORIAS (Implementar quando possível)

6. **Padronizar uso de funções helper**
   - Criar `auth_user_is_politico()`
   - Consistência no código

7. **Documentar campo metadata**
   - Ou remover se não usado

8. **Remover fallback de tenant em handle_new_user**
   - Melhor UX em produção

---

## 📋 Checklist de Validação

Antes de ir para produção, validar:

- [ ] Admin só pode modificar seu próprio tenant
- [ ] Tickets não são deletados ao deletar usuário
- [ ] Não há números de ticket duplicados (testar concorrência)
- [ ] Staff não pode modificar tickets de outro tenant
- [ ] Signup sem tenant_id falha com mensagem clara
- [ ] Profiles podem ser criados via admin/migration
- [ ] Todas as políticas RLS testadas com diferentes roles
- [ ] Seed data removido ou protegido com flag de ambiente

---

## 📊 Estatísticas

- **Total de tabelas:** 8
- **Total de políticas RLS:** 19
- **Total de funções:** 4
- **Total de triggers:** 7
- **Problemas críticos:** 3
- **Problemas importantes:** 2
- **Melhorias sugeridas:** 3

---

## 🎓 Recomendações Gerais

1. **Testes Automatizados:**
   - Criar testes de RLS policies
   - Testar cenários de concorrência
   - Testar isolamento multi-tenant

2. **Auditoria:**
   - Implementar logging em todas as políticas RLS
   - Monitorar tentativas de acesso cross-tenant

3. **Documentação:**
   - Documentar roles e permissões
   - Criar diagrama ER do banco
   - Documentar fluxo de signup com tenant_id

4. **Monitoramento:**
   - Alertas para tickets com números duplicados
   - Alertas para tentativas de acesso negado
   - Dashboard de uso por tenant

---

**Gerado por:** Claude Code
**Revisão:** Pendente aprovação
