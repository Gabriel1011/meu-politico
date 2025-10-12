'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TicketWithRelations, TicketStatus, UserRole } from '@/types'
import { TicketDetailModal } from './ticket-detail-modal'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
          <Card className={`${column.color} p-4`}>
            <h3 className="font-semibold">
              {column.title}
              <Badge variant="secondary" className="ml-2">
                {ticketsByStatus[column.id]?.length || 0}
              </Badge>
            </h3>
          </Card>

          <div className="space-y-3">
            {ticketsByStatus[column.id]?.map((ticket) => (
              <Card
                key={ticket.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedTicketId(ticket.id)
                  setIsModalOpen(true)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{ticket.titulo}</h4>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {ticket.descricao}
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">#{ticket.ticket_number}</span>
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
                    </div>
                  </div>
                </div>

                {/* Status change dropdown (staff only) */}
                {canChangeStatus && (
                  <Select
                    value={ticket.status}
                    onValueChange={(value) => {
                      handleStatusChange(ticket.id, value as TicketStatus)
                    }}
                  >
                    <SelectTrigger
                      className="mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      {KANBAN_COLUMNS.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Card>
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
