'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
import { MapPin } from 'lucide-react'
import { TicketComments } from './ticket-comments'
import { ticketsService } from '@/services/tickets.service'
import { logError } from '@/lib/error-handler'
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

export function TicketDetailModal({
  ticketId,
  open,
  onOpenChange,
  userRole,
}: TicketDetailModalProps) {
  const [ticket, setTicket] = useState<TicketWithRelations | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select(`
          *,
          profile (id, nome_completo, email, avatar_url),
          categories (id, nome, cor, icone)
        `)
        .eq('id', ticketId)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setTicket(data as TicketWithRelations)
      }
    } catch (err) {
      const appError = logError(err, 'TicketDetailModal.loadTicket')
      setError(appError.userMessage)
    } finally {
      setLoading(false)
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

                {/* Status Change (Staff only) */}
                {canChangeStatus && (
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
