# 🗄️ Guia de Setup do Supabase

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: meu-politico
   - **Database Password**: (gere uma senha forte)
   - **Region**: South America (São Paulo) - para menor latência
   - **Plan**: Free (suficiente para MVP)
5. Aguarde ~2 minutos para provisionamento

## 2. Obter Credenciais

1. No dashboard do projeto, vá em **Settings** > **API**
2. Copie os seguintes valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: (Role Key - SECRET - nunca exponha!)

## 3. Configurar .env.local

Crie o arquivo `.env.local` na raiz do projeto:

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

## 4. Executar Migrations

Após configurar as credenciais, execute:

```bash
# As migrations serão executadas via Supabase SQL Editor
# Instruções detalhadas no arquivo migrations/README.md
```

## 5. Verificar Conexão

Após tudo configurado, inicie o servidor:

```bash
npm run dev
```

O sistema deve conectar automaticamente ao Supabase.

---

**Próximo passo**: Criar as migrations do banco de dados
