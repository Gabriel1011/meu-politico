import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { RecentTicketsClient } from './recent-tickets-client'

interface RecentTicketsProps {
  tenantId: string
  userId: string
  role: string
}

export async function RecentTickets({
  tenantId,
  userId,
  role,
}: RecentTicketsProps) {
  const supabase = await createClient()

  // Se for cidadão, buscar apenas seus tickets
  // Se for staff, buscar todos do tenant
  let query = supabase
    .from('tickets')
    .select(`
      id,
      ticket_number,
      titulo,
      status,
      created_at,
      profile!tickets_user_id_fkey (nome_completo, email),
      categories (nome, cor)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (role === 'cidadao') {
    query = query.eq('user_id', userId)
  }

  const { data: tickets, error } = await query

  if (error) {
    console.error('Error loading tickets:', error)
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-gray-500">Nenhuma ocorrência encontrada</p>
        {role === 'cidadao' && (
          <Link
            href="/painel/ocorrencias/nova"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Criar primeira ocorrência
          </Link>
        )}
      </div>
    )
  }

  return <RecentTicketsClient tickets={tickets} role={role} />
}
