'use client'

import { useEffect, useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, User, UserCheck } from 'lucide-react'
import { TicketComments } from './ticket-comments'
import { ticketsService } from '@/services/tickets.service'
import { logError } from '@/lib/error-handler'
import { useUserContext } from '@/hooks/use-user-context'
import type { TicketWithRelations, TicketStatus, UserRole } from '@/types'
import { TICKET_STATUS_LABELS } from '@/types'

// Status variants for Badge component
const STATUS_VARIANTS = {
  nova: 'default' as const,
  em_analise: 'secondary' as const,
  em_andamento: 'default' as const,
  resolvida: 'success' as const,
  encerrada: 'secondary' as const,
  cancelada: 'destructive' as const,
}

interface TicketDetailModalProps {
  ticketId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userRole: UserRole
}

type StaffMember = {
  id: string
  nome_completo: string | null
  avatar_url: string | null
  role: string
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
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)

  useEffect(() => {
    if (ticketId && open) {
      loadTicket()
      if (userRole !== 'cidadao' && tenantId) {
        loadStaffMembers()
      }
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

  const loadStaffMembers = async () => {
    if (!tenantId) return

    setLoadingStaff(true)
    try {
      const members = await ticketsService.getStaffMembers(tenantId)
      setStaffMembers(members as StaffMember[])
    } catch (err) {
      logError(err, 'TicketDetailModal.loadStaffMembers')
    } finally {
      setLoadingStaff(false)
    }
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticketId) return

    try {
      await ticketsService.updateTicketStatus(ticketId, newStatus)
      loadTicket()
    } catch (err) {
      const appError = logError(err, 'TicketDetailModal.handleStatusChange')
      setError(appError.userMessage)
    }
  }

  const handleAssignChange = async (assignedToId: string | null) => {
    if (!ticketId) return

    try {
      await ticketsService.assignTicket(ticketId, assignedToId)
      loadTicket()
    } catch (err) {
      const appError = logError(err, 'TicketDetailModal.handleAssignChange')
      setError(appError.userMessage)
    }
  }

  if (!ticket) {
    return null
  }

  const canChangeStatus = userRole !== 'cidadao'

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center">Carregando...</div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadTicket}>Tentar novamente</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-2xl mb-2">{ticket.titulo}</DialogTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        #{ticket.ticket_number}
                      </Badge>
                      <Badge variant={STATUS_VARIANTS[ticket.status]}>
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </Badge>
                      {ticket.categories && (
                        <Badge
                          variant="outline"
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
              </DialogHeader>

              <div className="space-y-6">
                {/* Metadata Card */}
                <Card className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Criado por</p>
                      <p className="font-medium">{ticket.profile?.nome_completo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Data de criação</p>
                      <p className="font-medium">{formatDateTime(ticket.created_at)}</p>
                    </div>
                    {ticket.localizacao && typeof ticket.localizacao === 'object' && 'bairro' in ticket.localizacao && (
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground mb-1">Localização</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <p className="font-medium">{(ticket.localizacao as { bairro: string }).bairro}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Descrição</h3>
                  <Card className="p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.descricao}</p>
                  </Card>
                </div>

                {/* Photos Gallery */}
                {ticket.fotos && ticket.fotos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Fotos ({ticket.fotos.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ticket.fotos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-transparent hover:border-primary transition-all"
                          onClick={() => setSelectedImage(photo)}
                        >
                          <img
                            src={photo}
                            alt={`Foto ${index + 1}`}
                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Change and Assign (Staff only) */}
                {canChangeStatus && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                        Alterar Status
                      </h3>
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleStatusChange(e.target.value as TicketStatus)
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="nova">Nova</option>
                        <option value="em_analise">Em Análise</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="resolvida">Resolvida</option>
                        <option value="encerrada">Encerrada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Responsável
                      </h3>
                      {loadingStaff ? (
                        <p className="text-sm text-muted-foreground">Carregando...</p>
                      ) : (
                        <Select
                          value={ticket.assigned_to || 'unassigned'}
                          onValueChange={(value) =>
                            handleAssignChange(value === 'unassigned' ? null : value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {ticket.assigned_user ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={ticket.assigned_user.avatar_url || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {ticket.assigned_user.nome_completo?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{ticket.assigned_user.nome_completo}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Não atribuído</span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Não atribuído</span>
                              </div>
                            </SelectItem>
                            {user && (
                              <SelectItem value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-xs">EU</AvatarFallback>
                                  </Avatar>
                                  <span>Atribuir para mim</span>
                                </div>
                              </SelectItem>
                            )}
                            {staffMembers
                              .filter((member) => member.id !== user?.id)
                              .map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={member.avatar_url || undefined} />
                                      <AvatarFallback className="text-xs">
                                        {member.nome_completo?.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{member.nome_completo}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Card>
                  </div>
                )}

                {/* Comments Section */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                    Comentários
                  </h3>
                  <TicketComments ticketId={ticket.id} userRole={userRole} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute right-4 top-4 text-white text-2xl hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt="Visualização completa"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </>
  )
}
