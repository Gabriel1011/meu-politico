'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import type { TicketWithRelations, TicketStatus, UserRole } from '@/types'
import { TICKET_STATUS_LABELS } from '@/types'
import { TicketDetailModal } from './ticket-detail-modal'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

  const statusVariants: Record<TicketStatus, 'info' | 'warning' | 'default' | 'success' | 'secondary' | 'destructive'> = {
    nova: 'info',
    em_analise: 'warning',
    em_andamento: 'default',
    resolvida: 'success',
    encerrada: 'secondary',
    cancelada: 'destructive',
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
        >
          Todas
        </Button>
        <Button
          onClick={() => setFilter('nova')}
          variant={filter === 'nova' ? 'default' : 'outline'}
          size="sm"
        >
          Novas
        </Button>
        <Button
          onClick={() => setFilter('em_andamento')}
          variant={filter === 'em_andamento' ? 'default' : 'outline'}
          size="sm"
        >
          Em Andamento
        </Button>
        <Button
          onClick={() => setFilter('resolvida')}
          variant={filter === 'resolvida' ? 'default' : 'outline'}
          size="sm"
        >
          Resolvidas
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nenhuma ocorrência encontrada</p>
          {userRole === 'cidadao' && (
            <Link
              href="/painel/ocorrencias/nova"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Criar nova ocorrência
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedTicketId(ticket.id)
                setIsModalOpen(true)
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{ticket.titulo}</h3>
                    <span className="text-sm text-muted-foreground">
                      #{ticket.ticket_number}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {ticket.descricao}
                  </p>
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {ticket.categories && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: ticket.categories.cor,
                          color: ticket.categories.cor,
                          backgroundColor: `${ticket.categories.cor}15`
                        }}
                      >
                        {ticket.categories.nome}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      📅 {formatDateTime(ticket.created_at)}
                    </span>
                    {ticket.localizacao && typeof ticket.localizacao === 'object' && 'bairro' in ticket.localizacao && (
                      <span className="text-xs text-muted-foreground">
                        📍 {(ticket.localizacao as { bairro: string }).bairro}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={statusVariants[ticket.status]} className="shrink-0">
                  {TICKET_STATUS_LABELS[ticket.status]}
                </Badge>
              </div>
            </Card>
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
