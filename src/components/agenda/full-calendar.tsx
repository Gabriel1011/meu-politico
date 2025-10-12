'use client'

import { useCallback, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core'
import type { Database } from '@/types/database.types'
import { EventDetailModal } from './event-detail-modal'
import './full-calendar.css'

type Event = Database['public']['Tables']['events']['Row']

interface FullCalendarViewProps {
  events: Event[]
  onEventClick?: (event: Event) => void
  onDateSelect?: (start: Date, end: Date) => void
  editable?: boolean
}

export function FullCalendarView({
  events,
  onEventClick,
  onDateSelect,
  editable = false
}: FullCalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start_date,
    end: event.end_date,
    backgroundColor: event.published ? '#0D47A1' : '#9E9E9E',
    borderColor: event.published ? '#1976D2' : '#BDBDBD',
    extendedProps: {
      ...event
    }
  }))

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const event = clickInfo.event.extendedProps as Event
    setSelectedEvent(event)
    onEventClick?.(event)
  }, [onEventClick])

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    onDateSelect?.(selectInfo.start, selectInfo.end)
  }, [onDateSelect])

  return (
    <>
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
          }}
          locale="pt-br"
          events={calendarEvents}
          eventClick={handleEventClick}
          selectable={editable}
          select={handleDateSelect}
          editable={editable}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
        />
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  )
}
