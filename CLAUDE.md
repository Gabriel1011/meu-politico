# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Meu Político** is a multi-tenant SaaS platform that connects city council members (vereadores) with citizens through a ticket/issue tracking system. Built with Next.js 15, TypeScript, Supabase (PostgreSQL + Auth), and Shadcn/UI components.

## Development Commands

```bash
# Development
npm run dev                    # Start dev server with Turbopack
npm run build                  # Production build
npm run type-check             # TypeScript type checking (no emit)
npm run lint                   # ESLint
npm run format                 # Prettier formatting
npm run format:check           # Check formatting

# Database (Supabase CLI)
npm run db:status              # Check migration status
npm run db:push                # Push migrations to linked project
npm run db:pull                # Pull schema from linked project
npm run db:reset               # Reset linked database
npm run db:reset:local         # Reset local database
npm run migration:list         # List migrations
npm run migration:new <name>   # Create new migration
npm run supabase:start         # Start local Supabase
npm run supabase:stop          # Stop local Supabase
npm run supabase:status        # Check local Supabase status
```

## Architecture Overview

### Multi-tenancy Model

- **Tenant Detection**: Uses environment variable `TENANT_ID` for development, subdomain detection for production
- **RLS (Row Level Security)**: All database tables enforce tenant isolation through PostgreSQL RLS policies
- **Tenant Cookie**: Middleware injects `x-tenant-id` cookie for client-side tenant context
- **Dynamic Theming**: Each tenant has customizable primary/secondary colors stored in `tenants.cores` (JSON), converted to HSL CSS variables

### Authentication Flow

- **Supabase Auth**: Email/password authentication
- **Middleware Protection**: [middleware.ts](middleware.ts) handles session management and route protection
- **Protected Routes**: `/painel/*` requires authentication
- **Auth Routes**: `/login`, `/cadastro` redirect to dashboard if already authenticated
- **User Roles**: `cidadao` (citizen), `assessor` (staff), `vereador` (council member), `admin`

### Supabase Clients

Three client implementations following Supabase SSR best practices:

1. **Server Components**: `@/lib/supabase/server` - Uses `cookies()` from `next/headers`
2. **Client Components**: `@/lib/supabase/client` - Browser client for interactive components
3. **Middleware**: `@/lib/supabase/middleware` - Session refresh and route protection

All clients are typed with `Database` types from [src/types/database.types.ts](src/types/database.types.ts).

### Database Schema

Key tables (see [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql)):

- `tenants` - Multi-tenant configuration (slug, colors, plan)
- `profile` - User profiles with role-based access
- `tickets` - Citizen issue reports with status workflow
- `categories` - Tenant-specific issue categories
- `ticket_comments` - Comments with public/private visibility

Status workflow: `nova` → `em_analise` → `em_andamento` → `resolvida` → `encerrada`

### File Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication routes (login, cadastro)
│   ├── (dashboard)/      # Protected dashboard routes
│   │   └── painel/       # Main panel with tickets management
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Public home page
├── components/
│   ├── ui/               # Shadcn/UI primitives (button, input, etc.)
│   ├── auth/             # Login/signup forms
│   ├── dashboard/        # Dashboard stats and widgets
│   ├── layout/           # Header, sidebar components
│   └── tickets/          # Ticket list, kanban, detail modal, comments
├── lib/
│   ├── supabase/         # Supabase client factories
│   ├── color-utils.ts    # Hex to HSL conversion for tenant theming
│   └── utils.ts          # Shared utilities (cn, etc.)
└── types/
    ├── database.types.ts # Generated Supabase types
    └── index.ts          # App-specific TypeScript types
```

## Code Patterns and Conventions

### Bilingual Pattern

**Variables, functions, and types**: English
**UI messages, labels, and routes**: Portuguese

```typescript
// Types and variables in English
type TicketStatus = 'nova' | 'em_analise' | 'resolvida'

// UI labels in Portuguese
const TICKET_STATUS_LABELS = {
  nova: 'Nova',
  em_analise: 'Em Análise',
  resolvida: 'Resolvida',
}
```

### Component Patterns

- **Server Components by default**: Use Server Components unless interactivity is needed
- **Client Components**: Mark with `'use client'` only when using hooks, event handlers, or browser APIs
- **Shadcn/UI**: Prefer using existing UI primitives from `components/ui/` over custom implementations
- **Styling**: Use Tailwind CSS with `cn()` utility for conditional classes

### Type Safety

- Always import `Database` type from `@/types/database.types.ts` for Supabase queries
- Use type-safe row types: `Database['public']['Tables']['tickets']['Row']`
- Centralize app types in `types/index.ts` (e.g., `TicketWithRelations`)

### Tenant Theming

Dynamic CSS variables are injected via inline styles in tenant-aware layouts:

```typescript
import { hexToHSL, generateThemeVariables } from '@/lib/color-utils'

const themeVars = generateThemeVariables(tenant.cores)
// Applies to root element for CSS variable cascade
```

## Database Development

### Creating Migrations

```bash
npm run migration:new <descriptive_name>
```

Write idempotent SQL (use `IF NOT EXISTS`, `IF EXISTS`). Migrations are in [supabase/migrations/](supabase/migrations/).

### Key Functions

- `generate_ticket_number()` - Auto-generates sequential ticket numbers per tenant
- Defined in [supabase/migrations/003_functions.sql](supabase/migrations/003_functions.sql)

### RLS Policy Patterns

All tables use RLS. Common pattern:

```sql
-- Tenant isolation
CREATE POLICY "Users can only see their tenant's data"
  ON table_name FOR SELECT
  USING (tenant_id = auth.jwt()->>'tenant_id');

-- Role-based access
CREATE POLICY "Only staff can update"
  ON tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profile
      WHERE profile.id = auth.uid()
        AND profile.role IN ('assessor', 'vereador', 'admin')
    )
  );
```

## Environment Setup

Copy [.env.local.example](.env.local.example) to `.env.local`:

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `TENANT_ID` - Development tenant ID (get from `SELECT id FROM tenants`)

## Important Implementation Notes

### Path Aliases

Use `@/*` for imports: `import { createClient } from '@/lib/supabase/client'`

### Next.js 15 Features

- App Router with React Server Components
- Server Actions for mutations (not yet implemented, use client-side Supabase for now)
- `cookies()` is async in Next.js 15 - use `await cookies()`

### Shadcn/UI Components

Components are copied into [src/components/ui/](src/components/ui/) and can be customized. To add new components:

```bash
npx shadcn@latest add <component-name>
```

### Image Optimization

Configure remote patterns in [next.config.ts](next.config.ts) for Supabase Storage URLs.

## Current State

Project is **~95% complete for Phase 1 (MVP)**. See [PROGRESS.md](PROGRESS.md) for detailed status.

**Working features**:
- Authentication (login, signup, logout)
- Dashboard with statistics
- Ticket CRUD (create, list, detail view)
- Kanban and List views with status filters
- Comment system with public/private visibility
- Role-based access control
- Dynamic tenant theming

**Pending features**:
- Subdomain-based tenant detection (currently uses env var)
- User management (CRUD for profiles)
- Calendar/agenda feature
- PWA optimization
- Email notifications

## Testing Workflow

1. Create Supabase project
2. Run migrations via SQL Editor or CLI
3. Set up `.env.local` with credentials
4. Run `npm install && npm run dev`
5. Create account at `/cadastro`
6. Manually update `profile.role` in database to test staff features
7. Create tickets at `/painel/ocorrencias/nova`

## References

- [README.md](README.md) - Project overview
- [PROGRESS.md](PROGRESS.md) - Detailed feature completion status
- [package.json](package.json) - Dependencies and scripts
