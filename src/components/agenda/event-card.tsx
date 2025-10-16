'use client'

import type { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type Event = Database['public']['Tables']['events']['Row']

interface EventCardProps {
  event: Event
  onClick?: () => void
}

export function EventCard({ event, onClick }: EventCardProps) {
  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)

  const isSameDay =
    format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group"
      onClick={onClick}
    >
      {/* Banner Image */}
      {event.banner_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              // Hide image on error
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute top-3 right-3">
            <Badge
              variant={event.published ? 'default' : 'secondary'}
              className="shadow-md"
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
        </div>
      )}

      <CardContent className="p-5">
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </h3>
        </div>

        {/* Date, Time and Location */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">
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
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">
              {format(startDate, 'HH:mm', { locale: ptBR })} -{' '}
              {format(endDate, 'HH:mm', { locale: ptBR })}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Status Badge if not published and no image */}
        {!event.published && !event.banner_url && (
          <div className="mt-4">
            <Badge variant="secondary">
              <EyeOff className="mr-1 h-3 w-3" />
              Rascunho
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
