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
import { Calendar, Clock, MapPin, Eye, EyeOff, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

type Event = Database['public']['Tables']['events']['Row']

interface EventDetailModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  actions?: React.ReactNode
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  actions,
}: EventDetailModalProps) {
  if (!event) return null

  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)

  const isSameDay =
    format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0" showClose={false}>
        <VisuallyHidden>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            Detalhes do evento {event.title}
          </DialogDescription>
        </VisuallyHidden>
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Hero Section with Banner */}
          <div className="relative flex-shrink-0">
            {event.banner_url ? (
              <div className="relative h-64 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.banner_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image on error and show gradient background
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Status badge */}
                <div className="absolute top-4 left-4">
                  <Badge
                    variant={event.published ? 'default' : 'secondary'}
                    className="shadow-lg backdrop-blur-sm"
                  >
                    {event.published ? (
                      <>
                        <Eye className="mr-1.5 h-3 w-3" />
                        Público
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-1.5 h-3 w-3" />
                        Rascunho
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            ) : (
              /* Header without banner */
              <div className="relative h-32 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Status badge */}
                <div className="absolute top-4 left-6">
                  <Badge
                    variant={event.published ? 'default' : 'secondary'}
                    className="shadow-lg backdrop-blur-sm bg-white/90 text-foreground"
                  >
                    {event.published ? (
                      <>
                        <Eye className="mr-1.5 h-3 w-3" />
                        Público
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-1.5 h-3 w-3" />
                        Rascunho
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-foreground leading-tight mb-2">
                  {event.title}
                </h1>
              </div>

              {/* Info Cards - Modern grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Date Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 p-4 border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 backdrop-blur-sm">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                        Data
                      </p>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 leading-tight">
                        {isSameDay ? (
                          format(startDate, "d 'de' MMMM", { locale: ptBR })
                        ) : (
                          <>
                            {format(startDate, "d 'de' MMM", { locale: ptBR })} até{' '}
                            {format(endDate, "d 'de' MMM", { locale: ptBR })}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                        {format(startDate, 'yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 p-4 border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 backdrop-blur-sm">
                      <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                        Horário
                      </p>
                      <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 leading-tight">
                        {format(startDate, 'HH:mm', { locale: ptBR })}
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                        até {format(endDate, 'HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                {event.location && (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-4 border border-emerald-200/50 dark:border-emerald-800/50 sm:col-span-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 backdrop-blur-sm">
                        <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                          Local
                        </p>
                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 leading-tight line-clamp-2" title={event.location}>
                          {event.location}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <span>Detalhes do Evento</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-[15px]">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}

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
