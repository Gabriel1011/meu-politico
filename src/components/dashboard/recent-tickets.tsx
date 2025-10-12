import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

interface RecentTicketsProps {
  tenantId: string
  userId: string
  role: string
}

const statusColors = {
  nova: 'bg-blue-100 text-blue-800',
  em_analise: 'bg-yellow-100 text-yellow-800',
  em_andamento: 'bg-purple-100 text-purple-800',
  resolvida: 'bg-green-100 text-green-800',
  encerrada: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800',
}

const statusLabels = {
  nova: 'Nova',
  em_analise: 'Em Análise',
  em_andamento: 'Em Andamento',
  resolvida: 'Resolvida',
  encerrada: 'Encerrada',
  cancelada: 'Cancelada',
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
      profile (nome_completo, email),
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ocorrências Recentes</h2>
        <Link
          href="/painel/ocorrencias"
          className="text-sm text-primary hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Protocolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket: any) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ticket.ticket_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {ticket.titulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.categories?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        statusColors[ticket.status as keyof typeof statusColors]
                      }`}
                    >
                      {statusLabels[ticket.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(ticket.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
