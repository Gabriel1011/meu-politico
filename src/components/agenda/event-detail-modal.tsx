'use client'

import type { Database } from '@/types/database.types'
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
import Image from 'next/image'

type Event = Database['public']['Tables']['events']['Row']

interface EventDetailModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
}: EventDetailModalProps) {
  if (!event) return null

  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)

  const isSameDay =
    format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Banner Image */}
        {event.banner_url && (
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-gray-100">
            <Image
              src={event.banner_url}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-3xl font-bold pr-8">
                {event.title}
              </DialogTitle>
              <Badge
                variant={event.published ? 'default' : 'secondary'}
                className="shrink-0"
              >
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

          {/* Date, Time and Location */}
          <div className="flex flex-col gap-3 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Data
                </p>
                <p className="text-sm font-semibold">
                  {isSameDay ? (
                    format(startDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                  ) : (
                    <>
                      {format(startDate, "d 'de' MMMM", { locale: ptBR })} até{' '}
                      {format(endDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Horário
                </p>
                <p className="text-sm font-semibold">
                  {format(startDate, 'HH:mm', { locale: ptBR })} -{' '}
                  {format(endDate, 'HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Local
                  </p>
                  <p className="text-sm font-semibold">{event.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Sobre o evento</h3>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
