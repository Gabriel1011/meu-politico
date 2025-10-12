# 🏢 Configuração de Tenant para Desenvolvimento

## Como funciona o Multi-tenancy

A aplicação **Meu Político** usa multi-tenancy para permitir que múltiplos gabinetes (vereadores) usem a mesma aplicação com dados isolados.

### Produção vs Desenvolvimento

- **Produção**: Cada gabinete tem seu próprio subdomain
  - `vereador1.meuropolitico.com`
  - `vereador2.meuropolitico.com`

- **Desenvolvimento (localhost)**: Usar variável de ambiente `TENANT_ID`

---

## 🚀 Setup Rápido (Localhost)

### 1. Buscar o Tenant ID

Acesse o **SQL Editor** no [Supabase Dashboard](https://supabase.com/dashboard) e execute:

```sql
SELECT id, slug, nome FROM tenants WHERE ativo = true;
```

Você verá algo como:

```
id                                   | slug          | nome
-------------------------------------|---------------|---------------
550e8400-e29b-41d4-a716-446655440000 | demo          | Gabinete Demo
```

### 2. Configurar .env.local

Copie o `id` do tenant que você quer usar e cole no `.env.local`:

```bash
TENANT_ID=550e8400-e29b-41d4-a716-446655440000
```

### 3. Reiniciar o servidor

```bash
npm run dev
```

### 4. Acessar a aplicação

```
http://localhost:3004
```

Todos os usuários que se cadastrarem agora serão associados a esse tenant!

---

## 📝 Como funciona internamente

### Middleware (`lib/supabase/middleware.ts`)

```typescript
// Se TENANT_ID existe no .env, usa ele
if (process.env.TENANT_ID) {
  tenantId = process.env.TENANT_ID
} else {
  // Produção: extrai subdomain
  const subdomain = hostname.split('.')[0]
  // Busca tenant_id pelo subdomain no banco
}
```

### Cookie `x-tenant-id`

O middleware injeta o `tenant_id` em um cookie que fica disponível para:
- Server Components (via cookies)
- Client Components (via document.cookie)
- API Routes (via request.cookies)

### Row Level Security (RLS)

Todas as queries no Supabase automaticamente filtram por `tenant_id` graças às políticas RLS:

```sql
CREATE POLICY "Users can view tenant data"
ON tickets FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
```

---

## 🧪 Testando com múltiplos tenants

### Opção 1: Trocar a variável

Edite `.env.local` e reinicie o servidor:

```bash
# Tenant 1
TENANT_ID=550e8400-e29b-41d4-a716-446655440000

# Tenant 2 (depois de criar outro)
TENANT_ID=660e8400-e29b-41d4-a716-446655440001
```

### Opção 2: Criar múltiplos tenants

No SQL Editor:

```sql
INSERT INTO tenants (slug, nome, ativo)
VALUES 
  ('vereador-jose', 'Vereador José Silva', true),
  ('vereador-maria', 'Vereadora Maria Santos', true);
```

---

## ⚠️ Importante

- A variável `TENANT_ID` **só funciona em desenvolvimento** (localhost)
- Em produção, o tenant é detectado automaticamente pelo subdomain
- Não versione o `.env.local` com `TENANT_ID` preenchido (cada dev pode usar um tenant diferente)

---

## 🔧 Troubleshooting

### Erro: "Tenant não encontrado"

- Verifique se o `TENANT_ID` está correto no `.env.local`
- Confirme que o tenant existe e está ativo no banco
- Reinicie o servidor após alterar `.env.local`

### Não vejo categorias ou dados

- Certifique-se de que o `TENANT_ID` está configurado
- Verifique se as categorias foram criadas para esse tenant:

```sql
SELECT * FROM categories WHERE tenant_id = 'SEU_TENANT_ID';
```

### Usuário cadastrado sem tenant_id

Se isso acontecer (tenant_id NULL na tabela users), você pode corrigir manualmente:

```sql
UPDATE users 
SET tenant_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE email = 'seu_email@exemplo.com';
```

---

**Pronto!** Agora você pode desenvolver localmente com tenant isolation funcionando 🎉
