-- ============================================
-- SEED DATA: Meu Político
-- Descrição: Dados de teste para desenvolvimento
-- ============================================
-- IMPORTANTE: Este arquivo cria usuários de teste diretamente no banco
-- Para uso apenas em desenvolvimento local
-- ============================================

BEGIN;

-- ============================================
-- TENANT DE TESTE
-- ============================================
INSERT INTO public.tenants (id, slug, nome_publico, cores, contato, ativo, plano) VALUES
  (
    '10b101b9-9218-46d0-82d6-36643a906865',
    'demo',
    'Gabinete Vereador Demo',
    '{"primaria": "#0D47A1", "secundaria": "#1976D2"}'::jsonb,
    '{"email": "contato@demo.com", "telefone": "(11) 99999-9999"}'::jsonb,
    true,
    'pro'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CATEGORIAS DO TENANT DEMO
-- ============================================
INSERT INTO public.categories (tenant_id, nome, cor, icone, ordem, ativa) VALUES
  ('10b101b9-9218-46d0-82d6-36643a906865', 'Infraestrutura', '#EF4444', 'Construction', 1, true),
  ('10b101b9-9218-46d0-82d6-36643a906865', 'Saúde', '#10B981', 'Heart', 2, true),
  ('10b101b9-9218-46d0-82d6-36643a906865', 'Educação', '#3B82F6', 'GraduationCap', 3, true),
  ('10b101b9-9218-46d0-82d6-36643a906865', 'Segurança', '#F59E0B', 'Shield', 4, true),
  ('10b101b9-9218-46d0-82d6-36643a906865', 'Transporte', '#8B5CF6', 'Bus', 5, true),
  ('10b101b9-9218-46d0-82d6-36643a906865', 'Meio Ambiente', '#22C55E', 'Leaf', 6, true),
  ('10b101b9-9218-46d0-82d6-36643a906865', 'Iluminação Pública', '#FACC15', 'Lightbulb', 7, true),
  ('10b101b9-9218-46d0-82d6-36643a906865', 'Limpeza Urbana', '#06B6D4', 'Trash2', 8, true),
  ('10b101b9-9218-46d0-82d6-36643a906865', 'Assistência Social', '#EC4899', 'Users', 9, true),
  ('10b101b9-9218-46d0-82d6-36643a906865', 'Outros', '#6B7280', 'MoreHorizontal', 10, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- USUÁRIOS DE TESTE (auth.users + profiles)
-- ============================================

-- Cidadão de teste
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'cidadao@demo.com',
    crypt('Demo123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nome_completo":"João Silva","tenant_id":"10b101b9-9218-46d0-82d6-36643a906865"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'assessor@demo.com',
    crypt('Demo123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nome_completo":"Maria Santos","tenant_id":"10b101b9-9218-46d0-82d6-36643a906865"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'vereador@demo.com',
    crypt('Demo123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nome_completo":"Carlos Souza","tenant_id":"10b101b9-9218-46d0-82d6-36643a906865"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- Profiles dos usuários
-- Usar INSERT ... ON CONFLICT UPDATE para garantir que os dados corretos sejam inseridos
INSERT INTO public.profile (id, tenant_id, email, nome_completo, role, created_at, updated_at) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '10b101b9-9218-46d0-82d6-36643a906865',
    'cidadao@demo.com',
    'João Silva',
    'cidadao',
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '10b101b9-9218-46d0-82d6-36643a906865',
    'assessor@demo.com',
    'Maria Santos',
    'assessor',
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '10b101b9-9218-46d0-82d6-36643a906865',
    'vereador@demo.com',
    'Carlos Souza',
    'politico',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  nome_completo = EXCLUDED.nome_completo,
  role = EXCLUDED.role,
  updated_at = NOW();

-- ============================================
-- TICKETS DE EXEMPLO
-- ============================================
DO $$
DECLARE
  v_tenant_id UUID := '10b101b9-9218-46d0-82d6-36643a906865';
  v_cidadao_id UUID := '11111111-1111-1111-1111-111111111111';
  v_categoria_id UUID;
  v_ticket_id UUID;
BEGIN
  -- Pegar ID da categoria "Infraestrutura"
  SELECT id INTO v_categoria_id
  FROM public.categories
  WHERE tenant_id = v_tenant_id AND nome = 'Infraestrutura'
  LIMIT 1;

  -- Ticket 1: Nova
  INSERT INTO public.tickets (
    id, tenant_id, user_id, ticket_number,
    titulo, descricao, categoria_id,
    status, prioridade,
    created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    v_tenant_id,
    v_cidadao_id,
    'TP-2025-00001',
    'Buraco na Rua das Flores',
    'Há um buraco grande na Rua das Flores, altura do número 123, que está causando acidentes.',
    v_categoria_id,
    'nova',
    'alta',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ) RETURNING id INTO v_ticket_id;

  -- Comentário no ticket 1
  INSERT INTO public.ticket_comments (ticket_id, autor_id, mensagem, publico, created_at)
  VALUES (
    v_ticket_id,
    '22222222-2222-2222-2222-222222222222',
    'Obrigado pelo relato! Já encaminhamos a demanda para a Secretaria de Obras.',
    true,
    NOW() - INTERVAL '1 day'
  );

  -- Ticket 2: Em análise
  SELECT id INTO v_categoria_id
  FROM public.categories
  WHERE tenant_id = v_tenant_id AND nome = 'Iluminação Pública'
  LIMIT 1;

  INSERT INTO public.tickets (
    tenant_id, user_id, ticket_number,
    titulo, descricao, categoria_id,
    status, prioridade,
    created_at, updated_at
  ) VALUES (
    v_tenant_id,
    v_cidadao_id,
    'TP-2025-00002',
    'Poste de luz queimado',
    'O poste em frente ao número 456 da Rua Principal está sem luz há 5 dias.',
    v_categoria_id,
    'em_analise',
    'media',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days'
  );

  -- Ticket 3: Resolvida
  SELECT id INTO v_categoria_id
  FROM public.categories
  WHERE tenant_id = v_tenant_id AND nome = 'Limpeza Urbana'
  LIMIT 1;

  INSERT INTO public.tickets (
    tenant_id, user_id, ticket_number,
    titulo, descricao, categoria_id,
    status, prioridade,
    resolved_at,
    created_at, updated_at
  ) VALUES (
    v_tenant_id,
    v_cidadao_id,
    'TP-2025-00003',
    'Lixo acumulado na praça',
    'A praça central está com muito lixo acumulado há dias.',
    v_categoria_id,
    'resolvida',
    'baixa',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '1 day'
  );
END $$;

COMMIT;

-- ============================================
-- RESUMO DOS USUÁRIOS DE TESTE
-- ============================================
-- Email: cidadao@demo.com    | Senha: Demo123! | Role: cidadao
-- Email: assessor@demo.com   | Senha: Demo123! | Role: assessor
-- Email: vereador@demo.com   | Senha: Demo123! | Role: politico
--
-- Tenant: demo (Gabinete Vereador Demo)
-- 10 categorias criadas
-- 3 tickets de exemplo (nova, em análise, resolvida)
--
-- Para testar:
-- 1. Execute: supabase db reset (local)
-- 2. Faça login com um dos usuários acima
-- 3. Explore o sistema
