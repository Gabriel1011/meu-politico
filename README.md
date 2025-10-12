# 🏛️ Meu Político

Plataforma SaaS multi-tenant que conecta vereadores e cidadãos de forma transparente.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Type safety end-to-end
- **Tailwind CSS** - Styling utility-first
- **Shadcn/UI** - Componentes UI acessíveis e customizáveis
- **Supabase** - Backend-as-a-Service (Auth + Database + Storage)
- **PostgreSQL** - Database com Row Level Security (RLS)

## 📋 Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta no Supabase (gratuita)

## 🛠️ Setup do Projeto

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase.

### 3. Configurar Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Copie a URL e a ANON KEY do projeto
3. Cole as credenciais no arquivo `.env.local`

### 4. Executar migrations do banco

```bash
# Instruções serão adicionadas após configuração do Supabase CLI
```

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
meu-politico/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas protegidas
│   ├── (public)/          # Rotas públicas
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes Shadcn/UI
│   ├── layout/           # Header, Footer, Sidebar
│   └── tickets/          # Componentes de ocorrências
├── lib/                   # Utilitários e configurações
│   ├── supabase/         # Clients Supabase
│   └── utils.ts          # Funções auxiliares
├── hooks/                 # Custom React Hooks
├── types/                 # TypeScript types
└── supabase/              # Migrations e Edge Functions
```

## 🔑 Principais Funcionalidades

### Fase 1 - MVP (Em Desenvolvimento)

- [x] Setup inicial do projeto
- [ ] Multi-tenancy (detecção por subdomain)
- [ ] Autenticação (Supabase Auth)
- [ ] Gestão de ocorrências/tickets
- [ ] Painel administrativo (lista + kanban)
- [ ] Sistema de comentários
- [ ] Upload de imagens
- [ ] Agenda pública

## 📚 Documentação

- [Arquitetura Técnica](./ARCHITECTURE.md)
- [Escopo do Projeto](./Escopo%20—%20Plataforma%20Meu%20Político.md)

## 🤝 Contribuindo

Este é um projeto em desenvolvimento ativo. Contribuições são bem-vindas!

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para melhorar a comunicação entre cidadãos e vereadores**
