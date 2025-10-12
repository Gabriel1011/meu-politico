'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import type { TicketWithRelations, TicketStatus, UserRole } from '@/types'
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '@/types'
import { TicketDetailModal } from './ticket-detail-modal'

export function TicketList() {
  const [tickets, setTickets] = useState<TicketWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all')
  const [userRole, setUserRole] = useState<UserRole>('cidadao')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [filter])

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
      .order('created_at', { ascending: false })

    // Filter only user's tickets if citizen
    if (userData.role === 'cidadao') {
      query = query.eq('user_id', user.id)
    }

    // Apply status filter
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading tickets:', error)
    }

    if (data) {
      console.log('Tickets loaded:', data.length)
      setTickets(data as TicketWithRelations[])
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('nova')}
          className={`px-4 py-2 rounded ${
            filter === 'nova' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Novas
        </button>
        <button
          onClick={() => setFilter('em_andamento')}
          className={`px-4 py-2 rounded ${
            filter === 'em_andamento' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Em Andamento
        </button>
        <button
          onClick={() => setFilter('resolvida')}
          className={`px-4 py-2 rounded ${
            filter === 'resolvida' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Resolvidas
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-gray-500">Nenhuma ocorrência encontrada</p>
          {userRole === 'cidadao' && (
            <Link
              href="/painel/ocorrencias/nova"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Criar nova ocorrência
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-lg border bg-white p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedTicketId(ticket.id)
                setIsModalOpen(true)
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{ticket.titulo}</h3>
                    <span className="text-sm text-gray-500">
                      #{ticket.ticket_number}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {ticket.descricao}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    {ticket.categories && (
                      <span className="flex items-center gap-1">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: ticket.categories.cor }}
                        />
                        {ticket.categories.nome}
                      </span>
                    )}
                    <span>{formatDateTime(ticket.created_at)}</span>
                    {ticket.localizacao && typeof ticket.localizacao === 'object' && 'bairro' in ticket.localizacao && (
                      <span>📍 {(ticket.localizacao as { bairro: string }).bairro}</span>
                    )}
                  </div>
                </div>
                <span
                  className={`ml-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    TICKET_STATUS_COLORS[ticket.status]
                  }`}
                >
                  {TICKET_STATUS_LABELS[ticket.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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
