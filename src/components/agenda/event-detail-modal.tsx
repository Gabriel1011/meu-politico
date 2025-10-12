'use client'

import { AgendaEvent } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface EventDetailModalProps {
  event: AgendaEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetailModal({
  event,
  open,
  onOpenChange,
}: EventDetailModalProps) {
  if (!event) return null

  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)

  const isSameDay =
    format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl">{event.title}</DialogTitle>
            <Badge variant={event.published ? 'default' : 'secondary'}>
              {event.published ? (
                <>
                  <Eye className="mr-1 h-3 w-3" />
                  Público
                </>
              ) : (
                <>
                  <EyeOff className="mr-1 h-3 w-3" />
                  Rascunho
                </>
              )}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Banner Image */}
          {event.banner_url && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={event.banner_url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Date and Time */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {isSameDay ? (
                  format(startDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <>
                    {format(startDate, "d 'de' MMMM", { locale: ptBR })} até{' '}
                    {format(endDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(startDate, 'HH:mm', { locale: ptBR })} -{' '}
                {format(endDate, 'HH:mm', { locale: ptBR })}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold">Descrição</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {event.description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
