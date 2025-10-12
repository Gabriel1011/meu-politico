# 🚀 Instruções de Deploy - Meu Político

## 📋 Pré-requisitos

- [x] Node.js 20+ instalado
- [x] Conta no Supabase (gratuita)
- [ ] Conta no Vercel (opcional, gratuita)

---

## 1️⃣ Setup do Supabase

### Criar Projeto

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "**New Project**"
4. Preencha:
   - **Name**: `meu-politico`
   - **Database Password**: Gere uma senha forte (salve em local seguro!)
   - **Region**: `South America (São Paulo)` - menor latência para Brasil
   - **Plan**: Free (até 500MB de banco, 1GB storage, 2GB transferência)
5. Aguarde ~2 minutos para provisionamento

### Obter Credenciais

1. No dashboard do projeto, vá em **Settings** > **API**
2. Copie os seguintes valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: (SECRET - nunca exponha!)

### Executar Migrations

1. No dashboard, vá em **SQL Editor**
2. Abra os arquivos de migration na seguinte ordem:

   **Migration 001 - Schema Inicial**
   - Copie o conteúdo de `supabase/migrations/001_initial_schema.sql`
   - Cole no SQL Editor
   - Clique em **Run**
   - Aguarde conclusão (deve mostrar "Success")

   **Migration 002 - RLS Policies**
   - Copie o conteúdo de `supabase/migrations/002_rls_policies.sql`
   - Cole no SQL Editor
   - Clique em **Run**

   **Migration 003 - Functions**
   - Copie o conteúdo de `supabase/migrations/003_functions.sql`
   - Cole no SQL Editor
   - Clique em **Run**

   **Migration 004 - Seed Data**
   - Copie o conteúdo de `supabase/migrations/004_seed_data.sql`
   - Cole no SQL Editor
   - Clique em **Run**

### Configurar Storage

1. No dashboard, vá em **Storage**
2. Clique em "**Create a new bucket**"
3. Preencha:
   - **Name**: `uploads`
   - **Public bucket**: Marque ✅ (para permitir acesso público às imagens)
4. Clique em **Create bucket**

### Configurar Autenticação

1. No dashboard, vá em **Authentication** > **Providers**
2. **Email**: Já vem habilitado por padrão
3. (Opcional) Configure **Google OAuth** se desejar login social:
   - Obtenha credenciais no Google Cloud Console
   - Cole Client ID e Secret

---

## 2️⃣ Configurar Variáveis de Ambiente

1. Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

2. Edite o arquivo `.env.local` com suas credenciais do Supabase:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role)

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Meu Político

# Storage
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

---

## 3️⃣ Instalar Dependências e Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 4️⃣ Criar Primeiro Usuário

1. Acesse [http://localhost:3000/cadastro](http://localhost:3000/cadastro)
2. Preencha o formulário de cadastro
3. **Importante**: Verifique seu email (Supabase enviará link de confirmação)
4. Após confirmar, faça login

### Transformar em Vereador (Para Testes)

Por padrão, novos usuários são criados como `cidadao`. Para ter acesso total:

1. No Supabase, vá em **Table Editor** > **users**
2. Encontre seu usuário
3. Edite os campos:
   - **role**: Altere de `cidadao` para `vereador`
   - **tenant_id**: Copie o ID do tenant de teste (tabela `tenants`, slug `vereador-teste`)
4. Salve

Agora você terá acesso completo ao painel administrativo!

---

## 5️⃣ Deploy em Produção (Vercel)

### Opção A: Deploy via GitHub

1. Suba o código para um repositório GitHub
2. Acesse [https://vercel.com](https://vercel.com)
3. Clique em "**Import Project**"
4. Selecione seu repositório
5. Configure as variáveis de ambiente:
   - Adicione todas as vars do `.env.local`
   - **IMPORTANTE**: `NEXT_PUBLIC_APP_URL` deve ser sua URL do Vercel
6. Clique em "**Deploy**"

### Opção B: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... adicione todas as outras

# Deploy para produção
vercel --prod
```

---

## 6️⃣ Configurar Domínio Customizado (Opcional)

### No Vercel

1. Vá em **Settings** > **Domains**
2. Adicione seu domínio (ex: `meupolitico.app`)
3. Configure DNS conforme instruções

### Multi-tenant com Subdomínios

Para usar subdomínios dinâmicos (`vereador-teste.meupolitico.app`):

1. Configure wildcard DNS:
   - Tipo: `CNAME`
   - Name: `*`
   - Value: `cname.vercel-dns.com`

2. No Vercel, adicione wildcard domain:
   - `*.meupolitico.app`

---

## ✅ Checklist de Verificação

Antes de considerar o deploy concluído:

- [ ] Migrations executadas com sucesso no Supabase
- [ ] Bucket `uploads` criado e configurado como público
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Consegue criar conta e fazer login
- [ ] Consegue criar uma ocorrência
- [ ] Upload de imagens funcionando
- [ ] Dashboard exibindo estatísticas
- [ ] Lista e Kanban exibindo ocorrências

---

## 🆘 Troubleshooting

### Erro: "Failed to fetch"

- Verifique se as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretas
- Confirme que o projeto Supabase está ativo

### Erro: "Permission denied"

- Verifique se as RLS policies foram criadas (migration 002)
- Confirme que o usuário tem `tenant_id` associado

### Upload de imagens não funciona

- Verifique se o bucket `uploads` está configurado como **público**
- Confirme que a variável `NEXT_PUBLIC_STORAGE_BUCKET` está correta

### Email de confirmação não chega

- Verifique spam
- Em desenvolvimento, Supabase envia emails reais
- Para produção, configure SMTP customizado em **Authentication** > **Email Templates**

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a documentação oficial: [docs.supabase.com](https://docs.supabase.com)
- Verifique os logs no Supabase Dashboard
- Abra uma issue no repositório

---

**Última atualização**: 2025-10-12
