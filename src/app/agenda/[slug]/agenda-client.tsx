'use client'

import { useState } from 'react'
import { AgendaEvent } from '@/types'
import { EventCalendar } from '@/components/agenda/event-calendar'
import { EventDetailModal } from '@/components/agenda/event-detail-modal'

interface AgendaClientProps {
  events: AgendaEvent[]
}

export function AgendaClient({ events }: AgendaClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSelectEvent = (event: AgendaEvent) => {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  return (
    <>
      <EventCalendar events={events} onSelectEvent={handleSelectEvent} />

      <EventDetailModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
