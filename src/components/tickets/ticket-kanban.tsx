'use client'

import { useEffect, useState, useMemo, useCallback, memo } from 'react'
import type { TicketWithRelations, TicketStatus } from '@/types'
import { TicketDetailModal } from './ticket-detail-modal'
import { TicketAssignAvatar } from './ticket-assign-avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useUserContext } from '@/hooks/use-user-context'
import { ticketsService } from '@/services/tickets.service'
import { logError } from '@/lib/error-handler'
import { GripVertical } from 'lucide-react'

const KANBAN_COLUMNS: Array<{
  id: TicketStatus
  title: string
  color: string
  bgColor: string
  textColor: string
  borderColor: string
}> = [
  {
    id: 'nova',
    title: 'Nova',
    color: 'bg-blue-50',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  {
    id: 'em_analise',
    title: 'Em Análise',
    color: 'bg-yellow-50',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200'
  },
  {
    id: 'em_andamento',
    title: 'Em Andamento',
    color: 'bg-purple-50',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  {
    id: 'resolvida',
    title: 'Resolvida',
    color: 'bg-green-50',
    bgColor: 'bg-green-500',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
]

type TicketsByStatus = Record<TicketStatus, TicketWithRelations[]>

interface TicketKanbanProps {
  refreshToken?: number
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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

interface DraggableTicketCardProps {
  ticket: TicketWithRelations
  canChangeStatus: boolean
  canAssign: boolean
  tenantId: string
  currentUserId: string
  onClick: () => void
  onAssignChange: () => void
}

const DraggableTicketCard = memo(function DraggableTicketCard({ ticket, canChangeStatus, canAssign, tenantId, currentUserId, onClick, onAssignChange }: DraggableTicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    disabled: !canChangeStatus,
  })

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }), [transform, transition, isDragging])

  const handleCardClick = useCallback(() => {
    // Don't open modal if we're dragging
    if (isDragging) return
    onClick()
  }, [isDragging, onClick])

  const handleAvatarClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const badgeStyle = useMemo(() => ticket.categories ? {
    borderColor: ticket.categories.cor,
    color: ticket.categories.cor,
    backgroundColor: `${ticket.categories.cor}15`,
  } : undefined, [ticket.categories])

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(canChangeStatus ? { ...attributes, ...listeners } : {})}
      className={`p-4 hover:shadow-md transition-shadow ${
        canChangeStatus ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <h4 className="font-medium text-sm flex-1 min-w-0">{ticket.titulo}</h4>
        </div>
        <div
          className="flex-shrink-0"
          onClick={handleAvatarClick}
        >
          <TicketAssignAvatar
            ticketId={ticket.id}
            assignedUser={ticket.assigned_user}
            tenantId={tenantId}
            currentUserId={currentUserId}
            canAssign={canAssign}
            onAssignChange={onAssignChange}
          />
        </div>
      </div>
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
            style={badgeStyle}
          >
            {ticket.categories.nome}
          </Badge>
        )}
      </div>
    </Card>
  )
})

interface DroppableColumnProps {
  column: {
    id: TicketStatus
    title: string
    color: string
    bgColor: string
    textColor: string
    borderColor: string
  }
  tickets: TicketWithRelations[]
  canChangeStatus: boolean
  canAssign: boolean
  tenantId: string
  currentUserId: string
  onTicketClick: (ticketId: string) => void
  onAssignChange: () => void
  isOverColumn: boolean
}

const DroppableColumn = memo(function DroppableColumn({ column, tickets, canChangeStatus, canAssign, tenantId, currentUserId, onTicketClick, onAssignChange, isOverColumn }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const showHighlight = isOver || isOverColumn

  const ticketIds = useMemo(() => tickets.map((t) => t.id), [tickets])

  return (
    <div
      className={`flex flex-col space-y-3 rounded-xl p-3 transition-all w-[85vw] sm:w-[70vw] md:w-full snap-center ${
        showHighlight ? 'bg-primary/5 ring-2 ring-primary' : 'bg-muted/30'
      }`}
      style={{ height: 'calc(100vh - 180px)' }}
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${column.borderColor} bg-card shadow-sm flex-shrink-0`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${column.bgColor}`} />
          <h3 className={`font-semibold text-sm ${column.textColor}`}>
            {column.title}
          </h3>
        </div>
        <div className={`flex items-center justify-center min-w-[28px] h-6 px-2 rounded-md ${column.bgColor} text-white text-xs font-semibold`}>
          {tickets.length}
        </div>
      </div>

      {/* Tickets List with Scroll */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(128, 128, 128, 0.2) transparent'
        }}
      >
        <SortableContext items={ticketIds}>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <DraggableTicketCard
                key={ticket.id}
                ticket={ticket}
                canChangeStatus={canChangeStatus}
                canAssign={canAssign}
                tenantId={tenantId}
                currentUserId={currentUserId}
                onClick={() => onTicketClick(ticket.id)}
                onAssignChange={onAssignChange}
              />
            ))}

            {tickets.length === 0 && (
              <div className={`rounded-lg border-2 border-dashed ${column.borderColor} p-6 text-center`}>
                <p className="text-sm text-muted-foreground">Nenhuma ocorrência</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
})

export function TicketKanban({ refreshToken }: TicketKanbanProps) {
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
  const [activeTicket, setActiveTicket] = useState<TicketWithRelations | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag (optimized for performance)
      },
    })
  )

  const loadTickets = useCallback(async () => {
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
  }, [tenantId, user, role])

  useEffect(() => {
    if (tenantId && user) loadTickets()
  }, [tenantId, user?.id, refreshToken, loadTickets])

  const findTicketById = useCallback((id: string): TicketWithRelations | null => {
    for (const status of Object.keys(ticketsByStatus) as TicketStatus[]) {
      const ticket = ticketsByStatus[status]?.find((t) => t.id === id)
      if (ticket) return ticket
    }
    return null
  }, [ticketsByStatus])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const ticket = findTicketById(active.id as string)
    setActiveTicket(ticket)
  }, [findTicketById])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    setOverId(over?.id as string | null)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTicket(null)
    setOverId(null)

    if (!over) return

    const ticketId = active.id as string
    let targetStatus = over.id as string

    // Check if we dropped over a ticket (sortable item)
    // If so, find which column that ticket belongs to
    const validStatuses: TicketStatus[] = ['nova', 'em_analise', 'em_andamento', 'resolvida']

    if (!validStatuses.includes(targetStatus as TicketStatus)) {
      // We dropped over a ticket, not a column - find the column
      for (const status of validStatuses) {
        const column = ticketsByStatus[status]
        if (column?.some((t) => t.id === targetStatus)) {
          targetStatus = status
          break
        }
      }
    }

    const newStatus = targetStatus as TicketStatus

    // Validate that we found a valid status
    if (!validStatuses.includes(newStatus)) {
      console.log('Invalid drop target:', targetStatus)
      return
    }

    // Find the ticket and check if status actually changed
    const ticket = findTicketById(ticketId)
    if (!ticket) {
      console.error('Ticket not found:', ticketId)
      return
    }

    if (ticket.status === newStatus) {
      console.log('Status unchanged, skipping update')
      return
    }

    console.log('Updating ticket status:', { ticketId, from: ticket.status, to: newStatus })

    // Optimistic update
    setTicketsByStatus((prev) => {
      const updated = { ...prev }

      // Remove from old column
      if (updated[ticket.status]) {
        updated[ticket.status] = updated[ticket.status]!.filter((t) => t.id !== ticketId)
      }

      // Add to new column
      if (updated[newStatus]) {
        updated[newStatus] = [...updated[newStatus]!, { ...ticket, status: newStatus }]
      } else {
        updated[newStatus] = [{ ...ticket, status: newStatus }]
      }

      return updated
    })

    // Update in backend
    try {
      await ticketsService.updateTicketStatus(ticketId, newStatus)
    } catch (err) {
      const appError = logError(err, 'TicketKanban.handleDragEnd')
      setError(appError.userMessage)
      // Revert optimistic update on error
      loadTickets()
    }
  }, [ticketsByStatus, findTicketById, loadTickets])

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

  // Safety check - if user is null (e.g., during logout), don't render
  if (!user || !tenantId) {
    return null
  }

  const canChangeStatus = role !== 'cidadao'
  const canAssign = ['assessor', 'politico', 'admin'].includes(role)

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Mobile: Horizontal scroll | Desktop: Grid layout */}
        <div className="flex md:grid md:grid-cols-4 gap-4 h-full overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-hide">
          {KANBAN_COLUMNS.map((column) => {
            // Check if we're hovering over this column or any ticket in it
            const isHoveringColumn = overId === column.id
            const isHoveringTicket = ticketsByStatus[column.id]?.some((t) => t.id === overId) || false
            const isOverColumn = isHoveringColumn || isHoveringTicket

            return (
              <DroppableColumn
                key={column.id}
                column={column}
                tickets={ticketsByStatus[column.id] || []}
                canChangeStatus={canChangeStatus}
                canAssign={canAssign}
                tenantId={tenantId}
                currentUserId={user.id}
                isOverColumn={isOverColumn}
                onTicketClick={(ticketId) => {
                  setSelectedTicketId(ticketId)
                  setIsModalOpen(true)
                }}
                onAssignChange={loadTickets}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeTicket ? (
            <Card className="p-4 shadow-lg rotate-3 opacity-90">
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{activeTicket.titulo}</h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {activeTicket.descricao}
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      #{activeTicket.ticket_number}
                    </span>
                    {activeTicket.categories && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: activeTicket.categories.cor,
                          color: activeTicket.categories.cor,
                          backgroundColor: `${activeTicket.categories.cor}15`,
                        }}
                      >
                        {activeTicket.categories.nome}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

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
    </>
  )
}
