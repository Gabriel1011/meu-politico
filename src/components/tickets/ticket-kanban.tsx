'use client'

import { useEffect, useState } from 'react'
import type { TicketWithRelations, TicketStatus } from '@/types'
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
import { useUserContext } from '@/hooks/use-user-context'
import { ticketsService } from '@/services/tickets.service'
import { logError } from '@/lib/error-handler'

const KANBAN_COLUMNS: Array<{ id: TicketStatus; title: string; color: string }> = [
  { id: 'nova', title: 'Nova', color: 'bg-blue-50' },
  { id: 'em_analise', title: 'Em Análise', color: 'bg-yellow-50' },
  { id: 'em_andamento', title: 'Em Andamento', color: 'bg-purple-50' },
  { id: 'resolvida', title: 'Resolvida', color: 'bg-green-50' },
]

type TicketsByStatus = Record<TicketStatus, TicketWithRelations[]>

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {KANBAN_COLUMNS.map((column) => (
        <div key={column.id} className="space-y-4">
          <Card className={`${column.color} p-4 animate-pulse`}>
            <div className="h-6 bg-muted rounded w-24" />
          </Card>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TicketKanban() {
  const { user, tenantId, role, loading: authLoading } = useUserContext()

  const [ticketsByStatus, setTicketsByStatus] = useState<Partial<TicketsByStatus>>({
    nova: [],
    em_analise: [],
    em_andamento: [],
    resolvida: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (tenantId && user) loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, user?.id])

  const loadTickets = async () => {
    if (!tenantId || !user) return

    setLoading(true)
    setError(null)

    try {
      const data = await ticketsService.getTickets({
        tenantId,
        filters: {
          status: ['nova', 'em_analise', 'em_andamento', 'resolvida'],
          userId: role === 'cidadao' ? user.id : undefined,
        },
      })

      const grouped: Partial<TicketsByStatus> = {
        nova: data.filter((t) => t.status === 'nova'),
        em_analise: data.filter((t) => t.status === 'em_analise'),
        em_andamento: data.filter((t) => t.status === 'em_andamento'),
        resolvida: data.filter((t) => t.status === 'resolvida'),
      }

      setTicketsByStatus(grouped)
    } catch (err) {
      const appError = logError(err, 'TicketKanban.loadTickets')
      setError(appError.userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await ticketsService.updateTicketStatus(ticketId, newStatus)
      loadTickets()
    } catch (err) {
      const appError = logError(err, 'TicketKanban.handleStatusChange')
      setError(appError.userMessage)
    }
  }

  if (authLoading || loading) {
    return <KanbanSkeleton />
  }

  if (error) {
    return (
      <Card className="p-12 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={loadTickets}
          className="text-primary hover:underline"
        >
          Tentar novamente
        </button>
      </Card>
    )
  }

  const canChangeStatus = role !== 'cidadao'

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
                      <span className="text-xs text-muted-foreground">
                        #{ticket.ticket_number}
                      </span>
                      {ticket.categories && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: ticket.categories.cor,
                            color: ticket.categories.cor,
                            backgroundColor: `${ticket.categories.cor}15`,
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
            loadTickets()
          }
        }}
        userRole={role}
      />
    </div>
  )
}
