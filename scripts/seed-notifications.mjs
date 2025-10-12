import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TENANT_ID = process.env.TENANT_ID

if (!SUPABASE_URL) {
  console.error('⚠️  NEXT_PUBLIC_SUPABASE_URL não está definido no ambiente.')
  process.exit(1)
}

if (!SERVICE_ROLE_KEY) {
  console.error('⚠️  SUPABASE_SERVICE_ROLE_KEY não está definido no ambiente.')
  process.exit(1)
}

if (!TENANT_ID) {
  console.error('⚠️  TENANT_ID não está definido. Ajuste o arquivo .env antes de continuar.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
})

async function main() {
  console.log('🔎 Buscando usuários do tenant informado...')
  const { data: profiles, error: profilesError } = await supabase
    .from('profile')
    .select('id, nome_completo')
    .eq('tenant_id', TENANT_ID)
    .limit(5)

  if (profilesError) {
    console.error('❌ Erro ao buscar perfis:', profilesError.message)
    process.exit(1)
  }

  if (!profiles || profiles.length === 0) {
    console.error('⚠️  Nenhum usuário encontrado para o tenant informado.')
    process.exit(1)
  }

  const now = new Date()
  const notifications = profiles.flatMap((profile, index) => {
    const baseTime = new Date(now.getTime() - index * 60 * 60 * 1000)
    return [
      {
        tenant_id: TENANT_ID,
        destinatario_id: profile.id,
        titulo: 'Lembrete de agenda',
        mensagem: `Olá ${profile.nome_completo ?? 'usuário'}, não esqueça da reunião com a comunidade amanhã.`,
        tipo: 'agenda',
        created_at: new Date(baseTime.getTime() - 30 * 60 * 1000).toISOString(),
        metadados: { origem: 'agendamento', prioridade: 'alta' },
      },
      {
        tenant_id: TENANT_ID,
        destinatario_id: profile.id,
        titulo: 'Nova interação em ocorrência',
        mensagem: 'Uma ocorrência que você acompanha recebeu um novo comentário.',
        tipo: 'ocorrencia',
        created_at: new Date(baseTime.getTime() - 10 * 60 * 1000).toISOString(),
        metadados: { origem: 'tickets', status: 'em_andamento' },
      },
      {
        tenant_id: TENANT_ID,
        destinatario_id: profile.id,
        titulo: 'Ocorrência resolvida',
        mensagem: 'A equipe marcou como resolvida a ocorrência de iluminação pública.',
        tipo: 'ocorrencia',
        created_at: baseTime.toISOString(),
        lido_em: index % 2 === 0 ? new Date(baseTime.getTime() + 5 * 60 * 1000).toISOString() : null,
        metadados: { origem: 'tickets', status: 'resolvida' },
      },
    ]
  })

  console.log(`📝 Gerando ${notifications.length} notificações...`)
  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select('id, destinatario_id, titulo, created_at, lido_em')

  if (error) {
    console.error('❌ Erro ao inserir notificações:', error.message)
    process.exit(1)
  }

  console.log('✅ Notificações criadas com sucesso!')
  data?.forEach((notification) => {
    const status = notification.lido_em ? 'lida' : 'não lida'
    console.log(`  • ${notification.id} → ${notification.destinatario_id} (${status})`)
  })
}

main().catch((err) => {
  console.error('❌ Erro inesperado:', err)
  process.exit(1)
})
