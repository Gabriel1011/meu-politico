'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TicketWithRelations, TicketStatus, UserRole } from '@/types'
import { TICKET_STATUS_LABELS } from '@/types'
import { TicketDetailModal } from './ticket-detail-modal'

const KANBAN_COLUMNS: Array<{ id: TicketStatus; title: string; color: string }> = [
  { id: 'nova', title: 'Nova', color: 'bg-blue-50' },
  { id: 'em_analise', title: 'Em Análise', color: 'bg-yellow-50' },
  { id: 'em_andamento', title: 'Em Andamento', color: 'bg-purple-50' },
  { id: 'resolvida', title: 'Resolvida', color: 'bg-green-50' },
]

type TicketsByStatus = Record<TicketStatus, TicketWithRelations[]>

export function TicketKanban() {
  const [ticketsByStatus, setTicketsByStatus] = useState<Partial<TicketsByStatus>>({
    nova: [],
    em_analise: [],
    em_andamento: [],
    resolvida: [],
  })
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>('cidadao')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    setLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: userData } = await supabase
      .from('profile')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!userData) return

    setUserRole(userData.role as UserRole)

    let query = supabase
      .from('tickets')
      .select(`
        *,
        profile (nome_completo, email),
        categories (nome, cor)
      `)
      .eq('tenant_id', userData.tenant_id)
      .in('status', ['nova', 'em_analise', 'em_andamento', 'resolvida'])
      .order('created_at', { ascending: false })

    if (userData.role === 'cidadao') {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading tickets:', error)
    }

    if (data) {
      console.log('Tickets loaded:', data.length)
      const grouped: Partial<TicketsByStatus> = {
        nova: data.filter((t) => t.status === 'nova'),
        em_analise: data.filter((t) => t.status === 'em_analise'),
        em_andamento: data.filter((t) => t.status === 'em_andamento'),
        resolvida: data.filter((t) => t.status === 'resolvida'),
      }
      setTicketsByStatus(grouped)
    }

    setLoading(false)
  }

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', ticketId)

    if (!error) {
      loadTickets()
    }
  }

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>
  }

  const canChangeStatus = userRole !== 'cidadao'

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {KANBAN_COLUMNS.map((column) => (
        <div key={column.id} className="space-y-4">
          <div className={`rounded-lg ${column.color} p-4`}>
            <h3 className="font-semibold">
              {column.title}
              <span className="ml-2 text-sm text-gray-500">
                ({ticketsByStatus[column.id]?.length || 0})
              </span>
            </h3>
          </div>

          <div className="space-y-3">
            {ticketsByStatus[column.id]?.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedTicketId(ticket.id)
                  setIsModalOpen(true)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{ticket.titulo}</h4>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {ticket.descricao}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      <span>#{ticket.ticket_number}</span>
                      {ticket.categories && (
                        <span className="flex items-center gap-1">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: ticket.categories.cor }}
                          />
                          {ticket.categories.nome}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status change dropdown (staff only) */}
                {canChangeStatus && (
                  <select
                    value={ticket.status}
                    onChange={(e) => {
                      e.stopPropagation() // Prevent modal from opening
                      handleStatusChange(ticket.id, e.target.value as TicketStatus)
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent modal from opening
                    className="mt-3 w-full text-xs rounded border p-1"
                  >
                    {KANBAN_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )) || []}

            {(ticketsByStatus[column.id]?.length || 0) === 0 && (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                Nenhuma ocorrência
              </div>
            )}
          </div>
        </div>
      ))}

      <TicketDetailModal
        ticketId={selectedTicketId}
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) {
            setSelectedTicketId(null)
            loadTickets() // Reload to get updated status
          }
        }}
        userRole={userRole}
      />
    </div>
  )
}
