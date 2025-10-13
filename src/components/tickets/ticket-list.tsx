'use client'

/**
 * EXEMPLO DE REFATORAÇÃO - TicketList
 *
 * Este arquivo demonstra como o componente TicketList fica após as melhorias:
 * - Usa useUserContext para obter dados do usuário (elimina 30+ linhas de código repetido)
 * - Usa ticketsService para buscar dados (queries centralizadas)
 * - Tratamento de erros adequado
 * - Loading states visuais
 * - Código mais limpo e testável
 *
 * ANTES: 208 linhas com lógica espalhada
 * DEPOIS: ~120 linhas focadas na UI
 */

import { useEffect, useState, useMemo } from 'react'
import { Clock, MapPin, Inbox, AlertCircle, PlayCircle, CheckCircle2, Search } from 'lucide-react'
import { formatDateTime, cn } from '@/lib/utils'
import Link from 'next/link'
import type { TicketWithRelations, TicketStatus } from '@/types'
import { TICKET_STATUS_LABELS } from '@/types'
import { TicketDetailModal } from './ticket-detail-modal'
import { TicketAssignAvatar } from './ticket-assign-avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserContext } from '@/hooks/use-user-context'
import { ticketsService } from '@/services/tickets.service'
import { logError } from '@/lib/error-handler'

interface TicketListProps {
  refreshToken?: number
  onCreateRequest?: () => void
}

/**
 * Skeleton para loading state
 */
function TicketListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3 animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded w-20" />
              <div className="h-6 bg-muted rounded w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

/**
 * Componente de lista de tickets refatorado
 */
export function TicketList({ refreshToken, onCreateRequest }: TicketListProps) {
  // ✅ Hook customizado - substitui 30+ linhas de código repetido
  const { user, tenantId, role, loading: authLoading } = useUserContext()

  // Estado local (apenas UI)
  const [tickets, setTickets] = useState<TicketWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Buscar tickets quando mudar filtro
  useEffect(() => {
    if (!tenantId || !user) return

    loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, tenantId, user?.id, refreshToken])

  // Filtrar tickets por busca (número ou título) - DEVE estar antes dos early returns
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets

    const query = searchQuery.toLowerCase().trim()
    return tickets.filter((ticket) => {
      const matchesNumber = ticket.ticket_number?.toString().toLowerCase().includes(query)
      const matchesTitle = ticket.titulo?.toLowerCase().includes(query)
      return matchesNumber || matchesTitle
    })
  }, [tickets, searchQuery])

  const loadTickets = async () => {
    if (!tenantId || !user) return

    setLoading(true)
    setError(null)

    try {
      // ✅ Service centralizado - query limpa e reutilizável
      const data = await ticketsService.getTickets({
        tenantId,
        filters: {
          status: filter === 'all' ? undefined : filter,
          // Cidadãos veem apenas seus tickets
          userId: role === 'cidadao' ? user.id : undefined,
        },
      })

      setTickets(data)
    } catch (err) {
      // ✅ Tratamento de erro adequado
      const appError = logError(err, 'TicketList.loadTickets')
      setError(appError.userMessage)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (authLoading || loading) {
    return <TicketListSkeleton />
  }

  // Error state
  if (error) {
    return (
      <Card className="p-12 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadTickets}>Tentar novamente</Button>
      </Card>
    )
  }

  // Empty state
  if (tickets.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Nenhuma ocorrência encontrada</p>
        {role === 'cidadao' &&
          (onCreateRequest ? (
            <Button
              type="button"
              variant="link"
              className="mt-4"
              onClick={onCreateRequest}
            >
              Criar nova ocorrência
            </Button>
          ) : (
            <Link
              href="/painel/ocorrencias/nova"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Criar nova ocorrência
            </Link>
          ))}
      </Card>
    )
  }

  // Status variants para badges
  const statusVariants: Record<
    TicketStatus,
    'default' | 'secondary' | 'destructive'
  > = {
    nova: 'default',
    em_analise: 'default',
    em_andamento: 'default',
    resolvida: 'secondary',
    encerrada: 'secondary',
    cancelada: 'destructive',
  }

  const canAssign = ['assessor', 'vereador', 'admin'].includes(role)

  return (
    <div className="space-y-6">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por número ou título..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filtros - matching notifications screen style (sem ordenação) */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          className={cn('gap-2', filter === 'all' && 'shadow-sm')}
        >
          <Inbox className="h-4 w-4" />
          Todas
        </Button>
        <Button
          type="button"
          onClick={() => setFilter('nova')}
          variant={filter === 'nova' ? 'default' : 'outline'}
          size="sm"
          className={cn('gap-2', filter === 'nova' && 'shadow-sm')}
        >
          <AlertCircle className="h-4 w-4" />
          Novas
        </Button>
        <Button
          type="button"
          onClick={() => setFilter('em_analise')}
          variant={filter === 'em_analise' ? 'default' : 'outline'}
          size="sm"
          className={cn('gap-2', filter === 'em_analise' && 'shadow-sm')}
        >
          <Clock className="h-4 w-4" />
          Em Análise
        </Button>
        <Button
          type="button"
          onClick={() => setFilter('em_andamento')}
          variant={filter === 'em_andamento' ? 'default' : 'outline'}
          size="sm"
          className={cn('gap-2', filter === 'em_andamento' && 'shadow-sm')}
        >
          <PlayCircle className="h-4 w-4" />
          Em Andamento
        </Button>
        <Button
          type="button"
          onClick={() => setFilter('resolvida')}
          variant={filter === 'resolvida' ? 'default' : 'outline'}
          size="sm"
          className={cn('gap-2', filter === 'resolvida' && 'shadow-sm')}
        >
          <CheckCircle2 className="h-4 w-4" />
          Resolvidas
        </Button>
      </div>

      {/* Lista de tickets */}
      <div className="grid gap-4">
        {filteredTickets.length === 0 && searchQuery && (
          <Card className="p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma ocorrência encontrada para &quot;{searchQuery}&quot;
            </p>
          </Card>
        )}
        {filteredTickets.map((ticket) => (
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
                        backgroundColor: `${ticket.categories.cor}15`,
                      }}
                    >
                      {ticket.categories.nome}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(ticket.created_at)}
                  </div>
                  {ticket.localizacao &&
                    typeof ticket.localizacao === 'object' &&
                    'bairro' in ticket.localizacao && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {(ticket.localizacao as { bairro: string }).bairro}
                      </div>
                    )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <TicketAssignAvatar
                  ticketId={ticket.id}
                  assignedUser={ticket.assigned_user}
                  tenantId={tenantId!}
                  currentUserId={user!.id}
                  canAssign={canAssign}
                  onAssignChange={loadTickets}
                />
                <Badge
                  variant={statusVariants[ticket.status]}
                  className="shrink-0"
                >
                  {TICKET_STATUS_LABELS[ticket.status]}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de detalhes */}
      <TicketDetailModal
        ticketId={selectedTicketId}
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) {
            setSelectedTicketId(null)
            loadTickets() // Reload após fechar modal
          }
        }}
        userRole={role}
      />
    </div>
  )
}
