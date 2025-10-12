# 🗳️ Escopo — Plataforma Meu Político (App do Vereador)

## 🎯 Visão Geral

Aplicação SaaS multi-tenant que conecta vereadores e cidadãos de forma transparente, centralizando:

- Protocolo de demandas
- Comunicação e acompanhamento
- Agenda pública do mandato
- Personalização por gabinete (logo, cores, URL)
- Painel administrativo intuitivo (lista e kanban)

Stack principal: **Next.js + Supabase (PostgreSQL, Auth, Storage, Edge Functions)**
Deploy: **Vercel (frontend) + Supabase Cloud (backend/db)**

---

## 🧩 Estrutura geral de tenants

Cada **vereador/político** é um `tenant` dentro do sistema.
A tabela `tenants` define a identidade visual e configurações de cada gabinete.

**Exemplo de dados:**

```json
{
  "id": "uuid",
  "slug": "vereador-marcos",
  "nome_publico": "Gabinete do Vereador Marcos Silva",
  "logo_url": "https://cdn.meupolitico.app/logos/marcos.png",
  "cores": {"primaria": "#0D47A1", "secundaria": "#1976D2"},
  "ativo": true,
  "plano": "free"
}
```

RLS garante isolamento de dados: cada usuário só acessa registros do seu `tenant_id`.

---

## 🚀 Fase 1 — MVP funcional (foco em utilidade e personalização mínima)

### 🎯 Objetivo

Lançar uma versão funcional para **um vereador piloto**,
permitindo gestão de ocorrências, agenda pública e identidade visual do gabinete.

### 🧱 Funcionalidades principais

#### 1. Multi-tenant e identidade visual

- Cadastro de `tenant` (nome, slug, logo, cores primária/secundária)
- URL personalizada: `{slug}.meupolitico.app`
- Layout dinâmico carregando logo e cores do `tenant`
- Página pública com banner e links básicos do gabinete

#### 2. Autenticação e perfis

- Supabase Auth (email + magic link)
- Perfis: `cidadão`, `assessor`, `politico`
- Role-based UI e permissões
- RLS configurado por `tenant_id`

#### 3. Ocorrências (protocolo cidadão)

- Cidadão autenticado pode abrir uma ocorrência
  - Campos: título, descrição, categoria, foto opcional, localização (bairro)
- Geração automática de protocolo (`ticket_number`)
- Visualização do status da ocorrência
- Comentários / respostas entre gabinete e cidadão (thread pública)
- Notificação por email ao atualizar status

#### 4. Painel do gabinete

- Visualização de ocorrências em:
  - **Lista:** filtros por status, categoria, data
  - **Kanban:** colunas “Nova”, “Em análise”, “Resolvida”, “Encerrada”
- Atualização de status e comentários internos
- Edição de categorias (admin do tenant)

#### 5. Agenda pública do vereador

- CRUD simples de eventos: título, data, hora, local, descrição
- Exibição em lista ou calendário (sem integração externa ainda)
- Eventos públicos visíveis no site do vereador (`/agenda`)

#### 6. Configurações básicas do gabinete

- Editar logo, cores e informações de contato
- Alterar categorias de ocorrência
- Gerenciar equipe (adicionar/remover assessores)

#### 7. Infraestrutura

- Deploy único (Vercel) + tenants dinâmicos via middleware Next.js
- Banco Supabase com RLS e policies por `tenant_id`
- Edge Function para envio de e-mails e atualização de status
- Logs e métricas básicas

---

## 🧭 Fase 2 — Consolidação e engajamento

### 🎯 Objetivo

Aumentar o valor percebido e facilitar o engajamento e a produtividade do gabinete.

### 🧱 Funcionalidades

1. **Dashboard de métricas (vereador)**

   - Volume de ocorrências, SLA médio, taxa de resposta
   - Gráficos por categoria e bairro
   - Engajamento semanal/mensal

2. **Pesquisas e enquetes**

   - Criar enquetes simples (1–5 perguntas)
   - Resposta anônima ou autenticada
   - Visualização de resultados agregados

3. **Agenda pública integrada**

   - Integração com Google Calendar (read-only)
   - Sincronização automática de eventos

4. **Comunicação via WhatsApp**

   - Integração com WhatsApp Business API (envio de atualizações e respostas)
   - Template de mensagens automáticas (status da ocorrência, agradecimento etc.)

5. **Melhorias de UX**

   - Dark mode e melhor responsividade mobile
   - Filtros salvos e busca global
   - Notificações in-app e por e-mail

6. **Admin SaaS**
   - Painel “super admin” (time Meu Político)
   - Gestão de tenants, planos e logs
   - Estatísticas globais da plataforma

---

## 🧭 Fase 3 — Integração institucional e expansão

### 🎯 Objetivo

Escalar a solução e integrar com infraestrutura pública e BI.

### 🧱 Funcionalidades

1. **APIs públicas e integrações**

   - Integração com sistemas de Ouvidoria / Portal da Transparência
   - Webhooks para sistemas municipais

2. **Dashboard avançado**

   - Conector Power BI / Tableau
   - Exportação automática de relatórios

3. **App mobile dedicado (React Native)**

   - Notificações push nativas
   - Modo offline para abertura de ocorrências

4. **Gestão de múltiplos mandatos**

   - Permitir ao mesmo vereador ter histórico de mandatos
   - Transferência de dados de um tenant para outro

5. **Marketplace de plugins / extensões**
   - Templates de comunicação
   - Integrações com redes sociais
   - Módulos premium

---

## ⚙️ Stack técnica resumida

| Camada          | Tecnologia                                     |
| --------------- | ---------------------------------------------- |
| Frontend        | Next.js (App Router) + TailwindCSS + Shadcn/UI |
| Backend/API     | Next.js API Routes + Supabase Edge Functions   |
| Banco de dados  | PostgreSQL (Supabase) com RLS                  |
| Auth            | Supabase Auth (email, Google)                  |
| Storage         | Supabase Storage (anexos, logos)               |
| Deploy          | Vercel + Supabase Cloud                        |
| Observabilidade | Supabase logs + Logflare (Vercel)              |
| Design System   | Tokens de cor por tenant                       |

---

## 🧱 Estrutura inicial do banco (simplificada)

- **tenants** (id, slug, nome_publico, logo_url, cores, ativo)
- **users** (id, email, role, tenant_id, metadata)
- **tickets** (id, titulo, descricao, categoria, status, fotos[], tenant_id, user_id)
- **ticket_comments** (id, ticket_id, autor_id, mensagem, publico, created_at)
- **events** (id, titulo, descricao, inicio, fim, local, tenant_id)
- **categories** (id, nome, cor, tenant_id)
- **settings** (id, tenant_id, chave, valor)

---

## 📅 Cronograma sugerido

| Fase         | Duração estimada | Entregáveis principais                                  |
| ------------ | ---------------- | ------------------------------------------------------- |
| Fase 1 (MVP) | 6–8 semanas      | Tenancy + Auth + Ocorrências + Kanban + Agenda + Painel |
| Fase 2       | 6 semanas        | Dashboard, enquetes, WhatsApp, Google Calendar          |
| Fase 3       | 8–10 semanas     | APIs públicas, app mobile, integrações, marketplace     |

---

## 🧠 Considerações finais

- Iniciar com **1 vereador piloto** para validar fluxo e UX.
- Foco em **velocidade de entrega e simplicidade** no MVP.
- Garantir isolamento de dados (LGPD) desde a primeira versão.
- Estruturar código e banco já com `tenant_id` em todas as tabelas.
- Evoluir gradualmente para monetização e self-service de novos gabinetes.
