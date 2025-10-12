-- ============================================
-- MIGRATION 001: Initial Schema
-- Descrição: Cria schema inicial com tenants, users, categories, tickets
-- ============================================
-- Nota: As extensões foram movidas para 000_extensions.sql

-- ============================================
-- TENANTS (Gabinetes)
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome_publico TEXT NOT NULL,
  logo_url TEXT,
  cores JSONB DEFAULT '{"primaria": "#0D47A1", "secundaria": "#1976D2"}'::jsonb,
  contato JSONB,
  ativo BOOLEAN DEFAULT true,
  plano TEXT DEFAULT 'free' CHECK (plano IN ('free', 'pro', 'enterprise')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_ativo ON tenants(ativo);

-- ============================================
-- PROFILE (Perfis de usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome_completo TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('cidadao', 'assessor', 'politico', 'admin')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profile_tenant_id ON profile(tenant_id);
CREATE INDEX idx_profile_email ON profile(email);
CREATE INDEX idx_profile_role ON profile(role);

-- ============================================
-- CATEGORIES (Categorias de ocorrências)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#6B7280',
  icone TEXT,
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);
CREATE UNIQUE INDEX idx_categories_tenant_nome ON categories(tenant_id, nome);

-- ============================================
-- TICKETS (Ocorrências/Demandas)
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  ticket_number TEXT UNIQUE NOT NULL,

  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria_id UUID REFERENCES categories(id),

  status TEXT NOT NULL DEFAULT 'nova' CHECK (
    status IN ('nova', 'em_analise', 'em_andamento', 'resolvida', 'encerrada', 'cancelada')
  ),

  prioridade TEXT DEFAULT 'media' CHECK (
    prioridade IN ('baixa', 'media', 'alta', 'urgente')
  ),

  localizacao JSONB,
  fotos TEXT[] DEFAULT ARRAY[]::TEXT[],

  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_tickets_tenant_id ON tickets(tenant_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_categoria_id ON tickets(categoria_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- ============================================
-- TICKET_COMMENTS (Comentários/Respostas)
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,

  mensagem TEXT NOT NULL,
  publico BOOLEAN DEFAULT true,
  anexos TEXT[] DEFAULT ARRAY[]::TEXT[],

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_autor_id ON ticket_comments(autor_id);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at);

-- ============================================
-- EVENTS (Agenda do Vereador)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  criador_id UUID NOT NULL REFERENCES profile(id),

  titulo TEXT NOT NULL,
  descricao TEXT,

  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ,

  local TEXT,
  endereco JSONB,

  tipo TEXT DEFAULT 'reuniao' CHECK (
    tipo IN ('reuniao', 'audiencia', 'evento_publico', 'sessao', 'outro')
  ),

  publico BOOLEAN DEFAULT true,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_tenant_id ON events(tenant_id);
CREATE INDEX idx_events_inicio ON events(inicio);
CREATE INDEX idx_events_publico ON events(publico);

-- ============================================
-- SETTINGS (Configurações do Tenant)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
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
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profile(id) ON DELETE SET NULL,

  acao TEXT NOT NULL,
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID,

  dados_anteriores JSONB,
  dados_novos JSONB,

  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_logs_tenant_id ON activity_logs(tenant_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entidade ON activity_logs(entidade_tipo, entidade_id);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_updated_at BEFORE UPDATE ON profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at BEFORE UPDATE ON ticket_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
