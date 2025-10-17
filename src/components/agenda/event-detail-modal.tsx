'use client'

import type { Database } from '@/types/database.types'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, MapPin, X, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { toast } from 'sonner'

type Event = Database['public']['Tables']['events']['Row']

interface EventDetailModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  actions?: React.ReactNode
  slug?: string
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  actions,
  slug,
}: EventDetailModalProps) {
  if (!event) return null

  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)

  const isUpcoming = startDate > new Date()
  const isPast = endDate < new Date()
  const isHappening = !isUpcoming && !isPast

  const handleShare = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const agendaUrl = slug ? `${baseUrl}/agenda/${slug}` : baseUrl

    // Build the share text carefully
    const eventTitle = event.title || 'Evento'
    const eventLocation = event.location || 'Local a definir'
    const eventDate = format(startDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    const eventStartTime = format(startDate, 'HH:mm', { locale: ptBR })
    const eventEndTime = format(endDate, 'HH:mm', { locale: ptBR })
    const eventDescription = event.description || ''

    const shareText = [
      `📅 ${eventTitle}`,
      '',
      `📍 ${eventLocation}`,
      `🗓️ ${eventDate}`,
      `🕐 ${eventStartTime} - ${eventEndTime}`,
      '',
      eventDescription,
      '',
      `🔗 Ver agenda completa: ${agendaUrl}`
    ].join('\n')

    try {
      if (navigator.share) {
        await navigator.share({
          text: shareText,
        })
        toast.success('Evento compartilhado com sucesso!')
      } else {
        await navigator.clipboard.writeText(shareText)
        toast.success('Informações copiadas para a área de transferência!')
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareText)
          toast.success('Informações copiadas para a área de transferência!')
        } catch {
          toast.error('Não foi possível compartilhar o evento')
        }
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 gap-0" showClose={false}>
        <VisuallyHidden>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            Detalhes do evento {event.title}
          </DialogDescription>
        </VisuallyHidden>

        <div className="flex flex-col lg:flex-row h-full max-h-[95vh] relative">
          {/* Close button - Fixed at top right of modal */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 h-9 w-9 rounded-full bg-background/80 hover:bg-background backdrop-blur-md shadow-lg border"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Left Side - Image/Banner */}
          <div className="relative lg:w-2/5 flex-shrink-0">
            {event.banner_url ? (
              <div className="relative h-64 lg:h-full w-full overflow-hidden">
                <img
                  src={event.banner_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative h-64 lg:h-full bg-gradient-to-br from-primary via-primary/90 to-primary/70">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]" />
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')]" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="h-24 w-24 text-white/20" />
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Content */}
          <div className="flex-1 overflow-y-auto lg:w-3/5">
            <div className="p-6 lg:p-8 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {isHappening && (
                  <Badge variant="destructive" className="animate-pulse">
                    Acontecendo agora
                  </Badge>
                )}
                {isUpcoming && <Badge variant="default">Em breve</Badge>}
                {isPast && <Badge variant="outline">Evento realizado</Badge>}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {event.title}
                </h1>
              </div>

              {/* Date & Time Section */}
              <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-muted/50 border">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Data
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {format(startDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {format(startDate, 'EEEE', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block w-px bg-border" />

                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Horário
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {format(startDate, 'HH:mm', { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      até {format(endDate, 'HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/50 border">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Local
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground">
                    Sobre o evento
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Share Button */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar evento
                </Button>
              </div>

              {/* Actions */}
              {actions && (
                <div className="pt-4 border-t">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
