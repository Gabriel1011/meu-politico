import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, MapPin } from 'lucide-react'
import type { Database } from '@/types/database.types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Event = Database['public']['Tables']['events']['Row']

interface PublicEventCardProps {
  event: Event
  onClick?: () => void
}

export function PublicEventCard({ event, onClick }: PublicEventCardProps) {
  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)
  
  const dayNumber = format(startDate, 'd', { locale: ptBR })
  const monthName = format(startDate, 'MMM', { locale: ptBR })
  const year = format(startDate, 'yyyy', { locale: ptBR })
  const startTime = format(startDate, 'HH:mm', { locale: ptBR })
  const endTime = format(endDate, 'HH:mm', { locale: ptBR })
  const weekDay = format(startDate, 'EEEE', { locale: ptBR })

  const isUpcoming = startDate > new Date()
  const isPast = endDate < new Date()
  const isHappening = !isUpcoming && !isPast

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Date badge */}
        <div className="flex items-center justify-center bg-primary p-6 sm:w-32 sm:flex-col">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-foreground">
              {dayNumber}
            </div>
            <div className="text-sm font-medium uppercase text-primary-foreground/90">
              {monthName}
            </div>
            <div className="text-xs text-primary-foreground/70">{year}</div>
          </div>
        </div>

        {/* Event content */}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {isHappening && (
              <Badge variant="destructive" className="animate-pulse">
                Acontecendo agora
              </Badge>
            )}
            {isUpcoming && <Badge variant="secondary">Em breve</Badge>}
            {isPast && <Badge variant="outline">Realizado</Badge>}
          </div>

          <h3 className="mb-2 text-xl font-bold group-hover:text-primary sm:text-2xl">
            {event.title}
          </h3>

          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground sm:text-base">
            {event.description}
          </p>

          <div className="mt-auto space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="capitalize">{weekDay}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event banner image */}
        {event.banner_url && (
          <div className="h-48 sm:h-auto sm:w-64">
            <img
              src={event.banner_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </Card>
  )
}
