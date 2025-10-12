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
import { TicketComments } from './ticket-comments'
import type { TicketWithRelations, TicketStatus, UserRole } from '@/types'
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '@/types'

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (ticketId && open) {
      loadTicket()
    }
  }, [ticketId, open])

  const loadTicket = async () => {
    if (!ticketId) return

    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        profile (id, nome_completo, email, avatar_url),
        categories (id, nome, cor, icone)
      `)
      .eq('id', ticketId)
      .single()

    if (data) {
      setTicket(data as TicketWithRelations)
    }

    setLoading(false)
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticketId) return

    const supabase = createClient()

    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', ticketId)

    if (!error) {
      loadTicket()
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
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{ticket.titulo}</DialogTitle>
                    <p className="mt-1 text-sm text-gray-500">
                      Protocolo: #{ticket.ticket_number}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      TICKET_STATUS_COLORS[ticket.status]
                    }`}
                  >
                    {TICKET_STATUS_LABELS[ticket.status]}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Criado por:</span>
                    <p className="text-gray-600">{ticket.profile?.nome_completo || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Data de criação:</span>
                    <p className="text-gray-600">{formatDateTime(ticket.created_at)}</p>
                  </div>
                  {ticket.categories && (
                    <div>
                      <span className="font-medium">Categoria:</span>
                      <p className="flex items-center gap-2 text-gray-600">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: ticket.categories.cor }}
                        />
                        {ticket.categories.nome}
                      </p>
                    </div>
                  )}
                  {ticket.localizacao && typeof ticket.localizacao === 'object' && 'bairro' in ticket.localizacao && (
                    <div>
                      <span className="font-medium">Localização:</span>
                      <p className="text-gray-600">📍 {(ticket.localizacao as { bairro: string }).bairro}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="mb-2 font-medium">Descrição</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.descricao}</p>
                </div>

                {/* Photos Gallery */}
                {ticket.fotos && ticket.fotos.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-medium">Fotos ({ticket.fotos.length})</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {ticket.fotos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border"
                          onClick={() => setSelectedImage(photo)}
                        >
                          <img
                            src={photo}
                            alt={`Foto ${index + 1}`}
                            className="h-full w-full object-cover hover:scale-110 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Change (Staff only) */}
                {canChangeStatus && (
                  <div>
                    <h3 className="mb-2 font-medium">Alterar Status</h3>
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusChange(e.target.value as TicketStatus)
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="nova">Nova</option>
                      <option value="em_analise">Em Análise</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="resolvida">Resolvida</option>
                      <option value="encerrada">Encerrada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                )}

                {/* Comments Section */}
                <div className="border-t pt-6">
                  <h3 className="mb-4 font-medium">Comentários</h3>
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
