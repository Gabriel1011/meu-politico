'use client'

import type { Database } from '@/types/database.types'
import { EventCard } from './event-card'
import { AlertCircle } from 'lucide-react'

type Event = Database['public']['Tables']['events']['Row']

interface EventListProps {
  events: Event[]
  onEventClick?: (event: Event) => void
}

export function EventList({ events, onEventClick }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum evento encontrado
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Não há eventos cadastrados no momento. Que tal criar o primeiro evento?
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() => onEventClick?.(event)}
        />
      ))}
    </div>
  )
}
