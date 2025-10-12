# 🏛️ Arquitetura Técnica — Plataforma Meu Político

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura de Sistema](#-arquitetura-de-sistema)
3. [Stack Tecnológica](#-stack-tecnológica)
4. [Estrutura de Dados](#-estrutura-de-dados)
5. [Arquitetura Multi-Tenant](#-arquitetura-multi-tenant)
6. [Autenticação e Autorização](#-autenticação-e-autorização)
7. [Estrutura de Pastas](#-estrutura-de-pastas)
8. [Fluxos Principais](#-fluxos-principais)
9. [Segurança e Compliance](#-segurança-e-compliance)
10. [Infraestrutura e Deploy](#-infraestrutura-e-deploy)
11. [Monitoramento e Observabilidade](#-monitoramento-e-observabilidade)
12. [Roadmap de Implementação](#-roadmap-de-implementação)

---

## 🎯 Visão Geral

**Meu Político** é uma plataforma SaaS multi-tenant que conecta vereadores e cidadãos, permitindo:

- Gestão de demandas/ocorrências com protocolo
- Agenda pública do mandato
- Comunicação transparente e rastreável
- Personalização completa por gabinete (branding)
- Painel administrativo com visualizações em lista e kanban

### Princípios Arquiteturais

1. **Multi-tenancy por design**: Isolamento total de dados entre tenants
2. **LGPD-compliant**: Segurança e privacidade desde a fundação
3. **Escalabilidade horizontal**: Arquitetura serverless
4. **Developer Experience**: TypeScript end-to-end, type-safety
5. **Performance**: Edge computing, caching agressivo
6. **Manutenibilidade**: Código modular, padrões consistentes

---

## 🏗️ Arquitetura de Sistema

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUÁRIOS                                 │
│                                                                   │
│  Cidadãos           Assessores           Vereadores    Admins    │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js 14+ (App Router)                     │  │
│  │                                                            │  │
│  │  Middleware → Tenant Detection → Route Handler           │  │
│  │  (DNS/subdomain resolution)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌────────────┐ ┌──────────────┐
│   Supabase   │ │   Vercel   │ │  External    │
│              │ │   Blob     │ │  Services    │
│              │ │            │ │              │
│ - PostgreSQL │ │ - Storage  │ │ - Email      │
│ - Auth       │ │ - CDN      │ │ - WhatsApp   │
│ - Storage    │ │            │ │ - Analytics  │
│ - Edge Fn    │ │            │ │              │
│ - Realtime   │ │            │ │              │
└──────────────┘ └────────────┘ └──────────────┘
```

### Camadas da Aplicação

#### 1. Presentation Layer (Frontend)

- **Framework**: Next.js 14+ App Router
- **UI Components**: Shadcn/UI + Radix UI
- **Styling**: TailwindCSS com design tokens dinâmicos
- **State Management**: React Context + Server Components
- **Forms**: React Hook Form + Zod validation

#### 2. API Layer

- **Next.js API Routes**: REST endpoints
- **Server Actions**: Mutations diretas do servidor
- **Edge Functions**: Processamento distribuído
- **Supabase Client**: Database queries com RLS

#### 3. Data Layer

- **Supabase PostgreSQL**: Database principal
- **Row Level Security**: Isolamento por tenant
- **Realtime**: WebSocket subscriptions
- **Storage**: Arquivos e imagens

---

## 🛠️ Stack Tecnológica

### Core

| Categoria           | Tecnologia                    | Versão   | Justificativa                                 |
| ------------------- | ----------------------------- | -------- | --------------------------------------------- |
| **Runtime**         | Node.js                       | 20 LTS   | Estabilidade e performance                    |
| **Framework**       | Next.js                       | 14+      | App Router, Server Components, RSC            |
| **Language**        | TypeScript                    | 5.3+     | Type safety, DX                               |
| **Database**        | PostgreSQL (Supabase)         | 15+      | Relacional, RLS nativo, escalável             |
| **ORM/Client**      | Supabase JS Client            | 2.x      | Type-safe, RLS-aware                          |
| **Auth**            | Supabase Auth                 | 2.x      | OAuth, Magic Links, JWTs                      |
| **Storage**         | Supabase Storage              | 2.x      | S3-compatible, CDN integrado                  |

### Frontend

| Categoria           | Tecnologia                    | Justificativa                                 |
| ------------------- | ----------------------------- | --------------------------------------------- |
| **UI Components**   | Shadcn/UI + Radix UI          | Acessibilidade, customização                  |
| **Styling**         | TailwindCSS                   | Utility-first, theming dinâmico               |
| **Icons**           | Lucide React                  | Consistência, tree-shaking                    |
| **Forms**           | React Hook Form               | Performance, DX                               |
| **Validation**      | Zod                           | Runtime + compile-time validation             |
| **Date/Time**       | date-fns                      | Modular, funcional                            |
| **Drag & Drop**     | @dnd-kit                      | Kanban board                                  |
| **Calendar**        | React Big Calendar            | Agenda view                                   |

### DevOps & Tooling

| Categoria           | Tecnologia                    | Justificativa                                 |
| ------------------- | ----------------------------- | --------------------------------------------- |
| **Deploy**          | Vercel                        | Edge network, integração Next.js              |
| **CI/CD**           | GitHub Actions                | Automação, free tier                          |
| **Linting**         | ESLint + Prettier             | Code quality                                  |
| **Type Checking**   | TypeScript Compiler           | Pre-commit checks                             |
| **Testing**         | Vitest + Testing Library      | Unit + Integration tests                      |
| **E2E**             | Playwright                    | Critical user flows                           |
| **Monitoring**      | Vercel Analytics + Logflare   | Performance, errors                           |

---

## 📊 Estrutura de Dados

### Schema Principal (PostgreSQL)

```sql
-- ============================================
-- TENANTS (Gabinetes)
-- ============================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- URL: {slug}.meupolitico.app
  nome_publico TEXT NOT NULL,
  logo_url TEXT,
  cores JSONB DEFAULT '{"primaria": "#0D47A1", "secundaria": "#1976D2"}',
  contato JSONB, -- {email, telefone, endereco}
  ativo BOOLEAN DEFAULT true,
  plano TEXT DEFAULT 'free', -- free, pro, enterprise
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_ativo ON tenants(ativo);

-- ============================================
-- USERS (Perfis de usuários)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome_completo TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('cidadao', 'assessor', 'vereador', 'admin')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- CATEGORIES (Categorias de ocorrências)
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#6B7280', -- hex color
  icone TEXT, -- lucide icon name
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);
CREATE UNIQUE INDEX idx_categories_tenant_nome ON categories(tenant_id, nome);

-- ============================================
-- TICKETS (Ocorrências/Demandas)
-- ============================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_number TEXT UNIQUE NOT NULL, -- Protocolo: TP-2024-00001

  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria_id UUID REFERENCES categories(id),

  status TEXT NOT NULL DEFAULT 'nova' CHECK (
    status IN ('nova', 'em_analise', 'em_andamento', 'resolvida', 'encerrada', 'cancelada')
  ),

  prioridade TEXT DEFAULT 'media' CHECK (
    prioridade IN ('baixa', 'media', 'alta', 'urgente')
  ),

  localizacao JSONB, -- {bairro, logradouro, lat, lng}
  fotos TEXT[], -- URLs do Supabase Storage

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_tickets_tenant_id ON tickets(tenant_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_categoria_id ON tickets(categoria_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- ============================================
-- TICKET_COMMENTS (Comentários/Respostas)
-- ============================================
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  mensagem TEXT NOT NULL,
  publico BOOLEAN DEFAULT true, -- Se false, apenas equipe vê
  anexos TEXT[], -- URLs de arquivos

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_autor_id ON ticket_comments(autor_id);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at);

-- ============================================
-- EVENTS (Agenda do Vereador)
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  criador_id UUID NOT NULL REFERENCES users(id),

  titulo TEXT NOT NULL,
  descricao TEXT,

  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ,

  local TEXT,
  endereco JSONB, -- {logradouro, bairro, cidade}

  tipo TEXT DEFAULT 'reuniao' CHECK (
    tipo IN ('reuniao', 'audiencia', 'evento_publico', 'sessao', 'outro')
  ),

  publico BOOLEAN DEFAULT true,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_tenant_id ON events(tenant_id);
CREATE INDEX idx_events_inicio ON events(inicio);
CREATE INDEX idx_events_publico ON events(publico);

-- ============================================
-- SETTINGS (Configurações do Tenant)
-- ============================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  chave TEXT NOT NULL,
  valor JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_settings_tenant_chave ON settings(tenant_id, chave);

-- ============================================
-- ACTIVITY_LOGS (Auditoria)
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  acao TEXT NOT NULL, -- 'ticket.created', 'ticket.status_changed', etc
  entidade_tipo TEXT NOT NULL, -- 'ticket', 'event', 'user'
  entidade_id UUID,

  dados_anteriores JSONB,
  dados_novos JSONB,

  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_tenant_id ON activity_logs(tenant_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entidade ON activity_logs(entidade_tipo, entidade_id);
```

### Relacionamentos

```
tenants (1) ──────── (N) users
tenants (1) ──────── (N) tickets
tenants (1) ──────── (N) categories
tenants (1) ──────── (N) events
tenants (1) ──────── (N) settings

users (1) ──────── (N) tickets (criador)
users (1) ──────── (N) ticket_comments (autor)
users (1) ──────── (N) events (criador)

tickets (1) ──────── (N) ticket_comments
tickets (N) ──────── (1) categories

categories (1) ──────── (N) tickets
```

---

## 🏢 Arquitetura Multi-Tenant

### Estratégia de Isolamento

**Abordagem escolhida**: **Schema compartilhado com tenant_id** (Row-Level Security)

#### Vantagens

- ✅ Custo-efetivo (um único database)
- ✅ Fácil manutenção e migrations
- ✅ RLS nativo do PostgreSQL
- ✅ Performance adequada para centenas de tenants
- ✅ Backup e restore simplificados

#### Implementação

```typescript
// lib/supabase/rls-policies.sql

-- Exemplo de RLS Policy para tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Usuários só veem tickets do seu tenant
CREATE POLICY "Users can view tickets from their tenant"
  ON tickets
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Usuários podem criar tickets no seu tenant
CREATE POLICY "Users can create tickets in their tenant"
  ON tickets
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Apenas assessores e vereadores podem atualizar
CREATE POLICY "Staff can update tickets in their tenant"
  ON tickets
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users
      WHERE id = auth.uid()
      AND role IN ('assessor', 'vereador', 'admin')
    )
  );
```

### Tenant Detection

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 1. Detectar tenant via subdomain
  const hostname = req.headers.get('host') || ''
  const slug = hostname.split('.')[0]

  // 2. Buscar tenant no banco
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('ativo', true)
    .single()

  if (!tenant) {
    return NextResponse.redirect(new URL('/tenant-not-found', req.url))
  }

  // 3. Injetar tenant_id nos headers para uso nas pages
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-tenant-id', tenant.id)
  requestHeaders.set('x-tenant-slug', tenant.slug)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Tenant Context Provider

```typescript
// app/providers/tenant-provider.tsx
'use client'

import { createContext, useContext } from 'react'

interface Tenant {
  id: string
  slug: string
  nome_publico: string
  logo_url?: string
  cores: {
    primaria: string
    secundaria: string
  }
}

const TenantContext = createContext<Tenant | null>(null)

export function TenantProvider({
  tenant,
  children
}: {
  tenant: Tenant
  children: React.ReactNode
}) {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider')
  }
  return context
}
```

---

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │
       │ 1. Login (email + magic link)
       ▼
┌──────────────────┐
│  Supabase Auth   │
└──────┬───────────┘
       │
       │ 2. JWT Token gerado
       ▼
┌──────────────────┐
│   Next.js App    │ 3. Verifica token + tenant_id
└──────┬───────────┘
       │
       │ 4. Carrega user profile
       ▼
┌──────────────────┐
│  RLS Policies    │ 5. Filtra dados por tenant_id
└──────────────────┘
```

### Roles e Permissões

| Role       | Permissões                                                                       |
| ---------- | -------------------------------------------------------------------------------- |
| `cidadao`  | Criar tickets, comentar em seus tickets, visualizar agenda pública              |
| `assessor` | Todas de cidadão + gerenciar todos tickets, criar eventos                       |
| `vereador` | Todas de assessor + editar configurações do gabinete, gerenciar equipe          |
| `admin`    | Superusuário (gestão de múltiplos tenants, acesso global)                       |

### Guards de Autorização

```typescript
// lib/auth/guards.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth()
  const supabase = createServerComponentClient({ cookies })

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!user || !allowedRoles.includes(user.role)) {
    redirect('/unauthorized')
  }

  return user
}
```

### Server Actions com Autorização

```typescript
// app/actions/tickets.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createTicketSchema = z.object({
  titulo: z.string().min(5).max(200),
  descricao: z.string().min(10).max(5000),
  categoria_id: z.string().uuid(),
  localizacao: z.object({
    bairro: z.string().optional(),
  }).optional(),
})

export async function createTicket(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  // 1. Verificar autenticação
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'Não autenticado' }
  }

  // 2. Validar dados
  const validated = createTicketSchema.safeParse({
    titulo: formData.get('titulo'),
    descricao: formData.get('descricao'),
    categoria_id: formData.get('categoria_id'),
  })

  if (!validated.success) {
    return { error: 'Dados inválidos', details: validated.error }
  }

  // 3. Buscar tenant do usuário
  const { data: user } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', session.user.id)
    .single()

  if (!user) {
    return { error: 'Usuário não encontrado' }
  }

  // 4. Gerar número de protocolo
  const { count } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', user.tenant_id)

  const ticketNumber = `TP-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(5, '0')}`

  // 5. Criar ticket (RLS aplicado automaticamente)
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      tenant_id: user.tenant_id,
      user_id: session.user.id,
      ticket_number: ticketNumber,
      ...validated.data,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/tickets')
  return { data }
}
```

---

## 📁 Estrutura de Pastas

```
meu-politico/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
├── app/
│   ├── (auth)/                 # Auth routes group
│   │   ├── login/
│   │   ├── cadastro/
│   │   └── recuperar-senha/
│   ├── (dashboard)/            # Protected routes
│   │   ├── painel/             # Admin dashboard
│   │   │   ├── ocorrencias/
│   │   │   ├── agenda/
│   │   │   ├── configuracoes/
│   │   │   └── equipe/
│   │   └── layout.tsx
│   ├── (public)/               # Public routes
│   │   ├── agenda/
│   │   ├── sobre/
│   │   └── contato/
│   ├── api/
│   │   ├── webhooks/
│   │   ├── upload/
│   │   └── health/
│   ├── actions/                # Server Actions
│   │   ├── tickets.ts
│   │   ├── events.ts
│   │   └── settings.ts
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── providers.tsx           # Context providers
├── components/
│   ├── ui/                     # Shadcn/UI components
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── sidebar.tsx
│   ├── tickets/
│   │   ├── ticket-card.tsx
│   │   ├── ticket-list.tsx
│   │   ├── ticket-kanban.tsx
│   │   └── ticket-form.tsx
│   ├── agenda/
│   │   ├── event-calendar.tsx
│   │   └── event-list.tsx
│   └── theme/
│       └── theme-provider.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase
│   │   ├── server.ts           # Server-side Supabase
│   │   ├── middleware.ts
│   │   └── types.ts            # Generated types
│   ├── auth/
│   │   ├── guards.ts
│   │   └── permissions.ts
│   ├── utils/
│   │   ├── cn.ts               # Class name utility
│   │   ├── format.ts
│   │   └── validators.ts
│   └── constants/
│       └── index.ts
├── hooks/
│   ├── use-tenant.ts
│   ├── use-user.ts
│   └── use-tickets.ts
├── types/
│   ├── database.types.ts       # Supabase generated
│   └── global.d.ts
├── supabase/
│   ├── migrations/
│   ├── functions/              # Edge Functions
│   │   ├── send-email/
│   │   └── notification/
│   └── seed.sql
├── public/
│   ├── images/
│   └── fonts/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local.example
├── .env.production
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── ARCHITECTURE.md             # Este arquivo
└── README.md
```

---

## 🔄 Fluxos Principais

### 1. Criação de Ocorrência (Cidadão)

```
Cidadão
  │
  │ Preenche formulário
  ▼
Interface
  │
  │ Validação (Zod)
  ▼
Server Action
  │
  │ Verificar auth
  ▼
Supabase
  │
  │ Buscar tenant_id
  │ Gerar ticket_number
  │ INSERT ticket (RLS aplicado)
  ▼
Email Service
  │
  │ Notificar gabinete
  ▼
Exibir protocolo
```

### 2. Gestão de Ocorrência (Kanban)

```
Assessor
  │
  │ Arrasta ticket
  ▼
Kanban Board
  │
  │ updateTicketStatus()
  ▼
Server Action
  │
  │ Verificar role (assessor+)
  │ UPDATE tickets SET status
  ▼
Database
  │
  │ INSERT activity_log
  ▼
Realtime
  │
  │ Broadcast change
  ▼
Update UI
```

### 3. Autenticação Multi-Tenant

```
Usuário
  │
  │ Acessa {slug}.meupolitico.app
  ▼
Middleware
  │
  │ SELECT tenant WHERE slug = ?
  │ Inject headers (tenant_id)
  │ Verificar sessão
  ▼
Auth
  │
  │ JWT válido
  ▼
Database
  │
  │ SELECT user WHERE id = ?
  ▼
Renderiza página com contexto
```

---

## 🔒 Segurança e Compliance

### LGPD Compliance

#### Dados Pessoais Coletados

| Campo          | Finalidade                    | Base Legal           |
| -------------- | ----------------------------- | -------------------- |
| Nome           | Identificação                 | Consentimento        |
| Email          | Autenticação, notificações    | Consentimento        |
| Localização    | Contextualizar ocorrências    | Legítimo interesse   |
| IP Address     | Segurança, auditoria          | Legítimo interesse   |
| Fotos          | Documentar ocorrências        | Consentimento        |

#### Implementações

1. **Consentimento explícito**: Checkbox no cadastro
2. **Direito ao esquecimento**: Rota `/api/gdpr/delete-account`
3. **Portabilidade**: Export de dados em JSON
4. **Anonimização**: Dados de testes sempre faker
5. **Auditoria**: Tabela `activity_logs`

### Segurança

#### Medidas Implementadas

- ✅ **RLS (Row Level Security)**: Isolamento por tenant
- ✅ **Prepared Statements**: Prevenção de SQL Injection
- ✅ **CSRF Tokens**: Next.js automático
- ✅ **Rate Limiting**: Vercel Edge Middleware
- ✅ **Input Validation**: Zod em todos endpoints
- ✅ **Sanitização**: DOMPurify para user-generated content
- ✅ **HTTPS Only**: Forçado no Vercel
- ✅ **Secrets Management**: Variáveis de ambiente
- ✅ **Auditoria**: Logs de todas ações críticas

#### Headers de Segurança

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)'
  }
]
```

---

## ☁️ Infraestrutura e Deploy

### Ambientes

| Ambiente     | URL                                | Deploy              | Branch      |
| ------------ | ---------------------------------- | ------------------- | ----------- |
| Development  | localhost:3000                     | Local               | feature/*   |
| Preview      | {branch}.meupolitico.vercel.app    | Auto (PR)           | develop     |
| Staging      | staging.meupolitico.app            | Auto (push)         | staging     |
| Production   | {slug}.meupolitico.app             | Manual approval     | main        |

### Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Variáveis de Ambiente

```bash
# .env.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://{project}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY={anon_key}
SUPABASE_SERVICE_ROLE_KEY={service_role_key}

# App
NEXT_PUBLIC_APP_URL=https://meupolitico.app
NEXT_PUBLIC_APP_NAME=Meu Político

# Email (Resend)
RESEND_API_KEY={api_key}
EMAIL_FROM=noreply@meupolitico.app

# Storage
NEXT_PUBLIC_STORAGE_BUCKET=uploads

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID={id}
```

### Backups

- **Database**: Supabase automático (point-in-time recovery)
- **Storage**: Replicação automática S3
- **Frequency**: Diário (retém 30 dias)

---

## 📊 Monitoramento e Observabilidade

### Métricas Principais (KPIs)

| Métrica                | Target       | Ferramenta          |
| ---------------------- | ------------ | ------------------- |
| Uptime                 | 99.9%        | Vercel Status       |
| TTFB (Time to First Byte) | < 200ms   | Vercel Analytics    |
| LCP (Largest Contentful Paint) | < 2.5s | Web Vitals       |
| FID (First Input Delay) | < 100ms     | Web Vitals          |
| CLS (Cumulative Layout Shift) | < 0.1  | Web Vitals          |
| Error Rate             | < 0.1%       | Sentry              |
| Database Latency       | < 50ms       | Supabase Dashboard  |

### Logging

```typescript
// lib/logger.ts
import { createClient } from '@supabase/supabase-js'

export async function logActivity({
  acao,
  entidade_tipo,
  entidade_id,
  dados_anteriores,
  dados_novos,
}: {
  acao: string
  entidade_tipo: string
  entidade_id: string
  dados_anteriores?: any
  dados_novos?: any
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.from('activity_logs').insert({
    acao,
    entidade_tipo,
    entidade_id,
    dados_anteriores,
    dados_novos,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  })
}
```

### Alertas

- **Downtime**: Webhook para Slack
- **Errors > 1%**: Email para equipe
- **Database slow queries**: Notificação Supabase
- **Storage > 80%**: Alert dashboard

---

## 🗓️ Roadmap de Implementação

### Sprint 1-2: Fundação (Semanas 1-2)

- [ ] Setup projeto Next.js + TypeScript
- [ ] Configurar Supabase (database + auth)
- [ ] Implementar schema inicial + RLS
- [ ] Setup Vercel + CI/CD
- [ ] Implementar middleware de tenant detection
- [ ] Autenticação básica (magic link)

### Sprint 3-4: Multi-tenancy + UI Base (Semanas 3-4)

- [ ] Criar tabela tenants + seeding
- [ ] Implementar TenantProvider
- [ ] Setup Shadcn/UI + design tokens dinâmicos
- [ ] Layout base (header, footer, sidebar)
- [ ] Página pública do gabinete
- [ ] Sistema de rotas (auth / dashboard / public)

### Sprint 5-6: Ocorrências (Semanas 5-6)

- [ ] CRUD de categorias
- [ ] Formulário de criação de ticket (cidadão)
- [ ] Geração de protocolo
- [ ] Upload de fotos (Supabase Storage)
- [ ] Visualização de tickets (lista)
- [ ] Sistema de comentários
- [ ] Notificações por email

### Sprint 7-8: Painel Administrativo (Semanas 7-8)

- [ ] Dashboard de métricas básicas
- [ ] Kanban board (@dnd-kit)
- [ ] Filtros e busca
- [ ] Atualização de status
- [ ] Comentários internos
- [ ] Activity logs

### Sprint 9-10: Agenda + Configurações (Semanas 9-10)

- [ ] CRUD de eventos
- [ ] Calendário (React Big Calendar)
- [ ] Listagem pública de eventos
- [ ] Página de configurações do gabinete
- [ ] Upload de logo
- [ ] Editor de cores
- [ ] Gestão de equipe (CRUD de assessores)

### Sprint 11-12: Testes + Refinamentos (Semanas 11-12)

- [ ] Testes unitários (critical paths)
- [ ] Testes E2E (Playwright)
- [ ] Performance optimization
- [ ] Acessibilidade (a11y audit)
- [ ] Documentação
- [ ] Deploy em produção

---

## 📚 Convenções de Código

### TypeScript

```typescript
// Sempre tipar explicitamente funções públicas
export async function getUserTickets(userId: string): Promise<Ticket[]> {
  // ...
}

// Preferir interfaces para objetos de domínio
interface Ticket {
  id: string
  titulo: string
  status: TicketStatus
}

// Usar enums ou union types para estados finitos
type TicketStatus = 'nova' | 'em_analise' | 'resolvida' | 'encerrada'
```

### Nomenclatura

- **Arquivos**: kebab-case (`ticket-form.tsx`)
- **Componentes**: PascalCase (`TicketForm`)
- **Funções**: camelCase (`createTicket`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`TicketFormData`)

### Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona filtro por categoria no kanban
fix: corrige upload de múltiplas imagens
docs: atualiza documentação de RLS
refactor: extrai lógica de tenant detection
test: adiciona testes para createTicket action
```

---

## 🔗 Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

---

**Última atualização**: 2025-10-11
**Versão**: 1.0.0
**Autor**: Equipe Meu Político
