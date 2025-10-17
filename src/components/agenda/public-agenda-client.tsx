'use client'

import { useState, useMemo } from 'react'
import type { Database } from '@/types/database.types'
import { PublicEventCard } from './public-event-card'
import { EventFilters } from './event-filters'
import { EventDetailModal } from './event-detail-modal'
import { Calendar } from 'lucide-react'

type Event = Database['public']['Tables']['events']['Row']

interface PublicAgendaClientProps {
  events: Event[]
  slug: string
}

export function PublicAgendaClient({ events, slug }: PublicAgendaClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('all')

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let filtered = [...events]
    const now = new Date()

    // Apply time filter
    if (filterType === 'upcoming') {
      filtered = filtered.filter((event) => new Date(event.start_date) > now)
    } else if (filterType === 'past') {
      filtered = filtered.filter((event) => new Date(event.end_date) < now)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query)
      )
    }

    // Sort by date (most recent first - descending)
    filtered.sort((a, b) => {
      const dateA = new Date(a.start_date)
      const dateB = new Date(b.start_date)
      return dateB.getTime() - dateA.getTime() // Most recent first (descending)
    })

    return filtered
  }, [events, filterType, searchQuery])

  return (
    <>
      <EventFilters
        onSearchChange={setSearchQuery}
        onFilterChange={setFilterType}
      />

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Tente ajustar sua busca ou filtros'
              : 'Não há eventos publicados no momento'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <PublicEventCard
              key={event.id}
              event={event}
              onClick={() => handleSelectEvent(event)}
            />
          ))}
        </div>
      )}

      <EventDetailModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        slug={slug}
      />
    </>
  )
}
