'use client'

import { useEffect, useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import { formatTicketLocation } from '@/lib/location'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Hash, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { TicketComments } from './ticket-comments'
import { TicketAssignAvatar } from './ticket-assign-avatar'
import { ticketsService } from '@/services/tickets.service'
import { logError } from '@/lib/error-handler'
import { useUserContext } from '@/hooks/use-user-context'
import type { TicketWithRelations, TicketStatus, UserRole } from '@/types'

// Status config (ClickUp-inspired)
const STATUS_CONFIG = {
  nova: {
    label: 'Nova',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    dotColor: 'bg-gray-500',
  },
  em_analise: {
    label: 'Em Análise',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    dotColor: 'bg-blue-500',
  },
  em_andamento: {
    label: 'Em Andamento',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    dotColor: 'bg-purple-500',
  },
  resolvida: {
    label: 'Resolvida',
    color: 'bg-green-100 text-green-800 border-green-300',
    dotColor: 'bg-green-500',
  },
  encerrada: {
    label: 'Encerrada',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    dotColor: 'bg-slate-500',
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800 border-red-300',
    dotColor: 'bg-red-500',
  },
}

interface TicketDetailModalProps {
  ticketId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userRole: UserRole
}

export function TicketDetailModal({
  ticketId,
  open,
  onOpenChange,
  userRole,
}: TicketDetailModalProps) {
  const { user, tenantId } = useUserContext()
  const [ticket, setTicket] = useState<TicketWithRelations | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (ticketId && open) {
      loadTicket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, open])

  const loadTicket = async () => {
    if (!ticketId) return

    setLoading(true)
    setError(null)

    try {
      const data = await ticketsService.getTicketById(ticketId)
      setTicket(data)
    } catch (err) {
      const appError = logError(err, 'TicketDetailModal.loadTicket')
      setError(appError.userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticketId || !ticket) return

    // Optimistic update
    const previousStatus = ticket.status
    setTicket({ ...ticket, status: newStatus })

    try {
      await ticketsService.updateTicketStatus(ticketId, newStatus)
    } catch (err) {
      // Rollback on error
      setTicket({ ...ticket, status: previousStatus })
      const appError = logError(err, 'TicketDetailModal.handleStatusChange')
      setError(appError.userMessage)
    }
  }

  const handleAssignChange = async (userId: string | null) => {
    if (!ticket) return

    // Find the staff member info if assigning
    let newAssignedUser: typeof ticket.assigned_user = undefined
    if (userId && userId !== ticket.assigned_to) {
      // Fetch user info for optimistic update
      try {
        const data = await ticketsService.getTicketById(ticketId!)
        newAssignedUser = data.assigned_user
      } catch {
        // Fallback to just updating the ID
      }
    }

    // Optimistic update
    setTicket({
      ...ticket,
      assigned_to: userId,
      assigned_user: newAssignedUser,
    })
  }

  if (!ticket) {
    return null
  }

  const canChangeStatus = userRole !== 'cidadao'
  const statusConfig = ticket ? STATUS_CONFIG[ticket.status] : null
  const locationLabel = formatTicketLocation(ticket.localizacao)

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!ticket?.fotos || ticket.fotos.length === 0) return

    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? ticket.fotos.length - 1 : prev - 1))
    } else {
      setCurrentImageIndex((prev) => (prev === ticket.fotos.length - 1 ? 0 : prev + 1))
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[85vh] p-0 gap-0">
          {loading ? (
            <div className="py-12 text-center">Carregando...</div>
          ) : error ? (
            <div className="py-12 text-center px-6">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadTicket}>Tentar novamente</Button>
            </div>
          ) : (
            <>
              {/* Mobile Layout - Tabs */}
              <div className="lg:hidden">
                <Tabs defaultValue="details" className="flex flex-col min-h-[80vh] max-h-[85vh]">
                  <div className="border-b px-6 pt-6 pb-0">
                    {/* Header with ticket number and title */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Hash className="h-4 w-4" />
                        <span className="font-mono text-sm font-medium">
                          {ticket.ticket_number}
                        </span>
                      </div>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold leading-tight mb-4">
                          {ticket.titulo}
                        </DialogTitle>
                      </DialogHeader>
                    </div>

                    {/* Tabs Navigation */}
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="details">Detalhes</TabsTrigger>
                      <TabsTrigger value="comments">Comentários</TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Details Tab */}
                  <TabsContent value="details" className="flex-1 overflow-y-auto p-6 mt-0">
                    {/* Metadata Grid - 2 items per row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
                      {/* Status */}
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                        {canChangeStatus ? (
                          <Select
                            value={ticket.status}
                            onValueChange={(value) => handleStatusChange(value as TicketStatus)}
                          >
                            <SelectTrigger className="w-full border-0 bg-muted/50 h-auto p-0 shadow-none">
                              <SelectValue>
                                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-md border ${statusConfig?.color}`}>
                                  <div className={`w-2 h-2 rounded-full ${statusConfig?.dotColor}`} />
                                  <span className="font-medium text-sm">{statusConfig?.label}</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                                    <span>{config.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-md border ${statusConfig?.color}`}>
                            <div className={`w-2 h-2 rounded-full ${statusConfig?.dotColor}`} />
                            <span className="font-medium text-sm">{statusConfig?.label}</span>
                          </div>
                        )}
                      </div>

                      {/* Assigned User (Staff only) */}
                      {canChangeStatus && user && tenantId && (
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-muted-foreground">Responsável</span>
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-md border bg-muted/50">
                            <TicketAssignAvatar
                              ticketId={ticket.id}
                              assignedUser={ticket.assigned_user}
                              tenantId={tenantId}
                              currentUserId={user.id}
                              canAssign={canChangeStatus}
                              onAssignChange={handleAssignChange}
                            />
                            {ticket.assigned_user && (
                              <span className="text-sm font-medium">
                                {ticket.assigned_user.nome_completo}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Category */}
                      {ticket.categories && (
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-muted-foreground">Categoria</span>
                          <div
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border w-fit"
                            style={{
                              borderColor: ticket.categories.cor,
                              color: ticket.categories.cor,
                              backgroundColor: `${ticket.categories.cor}20`,
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: ticket.categories.cor }}
                            />
                            {ticket.categories.nome}
                          </div>
                        </div>
                      )}

                      {/* Creator */}
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Criado por</span>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-md border bg-muted/50">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={ticket.profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {ticket.profile?.nome_completo?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{ticket.profile?.nome_completo || 'Usuário'}</span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(ticket.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      {locationLabel && (
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-muted-foreground">Localização</span>
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-md border bg-muted/50">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">
                              {locationLabel}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description Section */}
                    <div className="mb-8">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Descrição
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                          {ticket.descricao}
                        </p>
                      </div>
                    </div>

                    {/* Photos Section */}
                    {ticket.fotos && ticket.fotos.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Anexos ({ticket.fotos.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {ticket.fotos.map((photo, index) => (
                            <button
                              key={index}
                              className="relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all group"
                              onClick={() => {
                                setSelectedImage(photo)
                                setCurrentImageIndex(index)
                              }}
                            >
                              <img
                                src={photo}
                                alt={`Foto ${index + 1}`}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Comments Tab */}
                  <TabsContent value="comments" className="flex-1 overflow-y-auto p-6 mt-0">
                    <div className="h-full flex flex-col">
                      <TicketComments ticketId={ticket.id} userRole={userRole} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Desktop Layout - Sidebar */}
              <div className="hidden lg:flex flex-col lg:flex-row min-h-[80vh] max-h-[85vh]">
                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                  {/* Header with ticket number and title */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Hash className="h-4 w-4" />
                      <span className="font-mono text-sm font-medium">
                        {ticket.ticket_number}
                      </span>
                    </div>
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-bold leading-tight mb-6">
                        {ticket.titulo}
                      </DialogTitle>
                    </DialogHeader>

                  {/* Metadata Grid - 2 items per row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
                    {/* Status */}
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      {canChangeStatus ? (
                        <Select
                          value={ticket.status}
                          onValueChange={(value) => handleStatusChange(value as TicketStatus)}
                        >
                          <SelectTrigger className="w-full border-0 bg-muted/50 h-auto p-0 shadow-none">
                            <SelectValue>
                              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-md border ${statusConfig?.color}`}>
                                <div className={`w-2 h-2 rounded-full ${statusConfig?.dotColor}`} />
                                <span className="font-medium text-sm">{statusConfig?.label}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                                  <span>{config.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-md border ${statusConfig?.color}`}>
                          <div className={`w-2 h-2 rounded-full ${statusConfig?.dotColor}`} />
                          <span className="font-medium text-sm">{statusConfig?.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned User (Staff only) */}
                    {canChangeStatus && user && tenantId && (
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Responsável</span>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-md border bg-muted/50">
                          <TicketAssignAvatar
                            ticketId={ticket.id}
                            assignedUser={ticket.assigned_user}
                            tenantId={tenantId}
                            currentUserId={user.id}
                            canAssign={canChangeStatus}
                            onAssignChange={handleAssignChange}
                          />
                          {ticket.assigned_user && (
                            <span className="text-sm font-medium">
                              {ticket.assigned_user.nome_completo}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Category */}
                    {ticket.categories && (
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Categoria</span>
                        <div
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border w-fit"
                          style={{
                            borderColor: ticket.categories.cor,
                            color: ticket.categories.cor,
                            backgroundColor: `${ticket.categories.cor}20`,
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: ticket.categories.cor }}
                          />
                          {ticket.categories.nome}
                        </div>
                      </div>
                    )}

                    {/* Creator */}
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Criado por</span>
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-md border bg-muted/50">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={ticket.profile?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {ticket.profile?.nome_completo?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{ticket.profile?.nome_completo || 'Usuário'}</span>
                          <span className="text-xs text-muted-foreground">{formatDateTime(ticket.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    {locationLabel && (
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Localização</span>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-md border bg-muted/50">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            {locationLabel}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Section */}
                <div className="mb-8">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Descrição
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {ticket.descricao}
                    </p>
                  </div>
                </div>

                {/* Photos Section */}
                {ticket.fotos && ticket.fotos.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Anexos ({ticket.fotos.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ticket.fotos.map((photo, index) => (
                        <button
                          key={index}
                          className="relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all group"
                          onClick={() => {
                            setSelectedImage(photo)
                            setCurrentImageIndex(index)
                          }}
                        >
                          <img
                            src={photo}
                            alt={`Foto ${index + 1}`}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

                {/* Sidebar - Comments/Activity */}
                <div className="lg:w-96 lg:border-l bg-muted/30 p-6 flex flex-col min-h-0">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex-shrink-0">
                    Atividade
                  </h3>
                  <div className="flex-1 min-h-0">
                    <TicketComments ticketId={ticket.id} userRole={userRole} />
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Lightbox with Navigation */}
      {selectedImage && ticket?.fotos && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </button>

          {ticket.fotos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  handleImageNavigation('prev')
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  handleImageNavigation('next')
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={ticket.fotos[currentImageIndex]}
              alt={`Foto ${currentImageIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {ticket.fotos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm">
                {currentImageIndex + 1} / {ticket.fotos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
