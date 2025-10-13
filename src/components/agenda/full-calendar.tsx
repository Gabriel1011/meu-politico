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
    backgroundColor: event.published ? '#1565C0' : '#78909C',
    borderColor: event.published ? '#0D47A1' : '#546E7A',
    textColor: '#ffffff',
    classNames: event.published ? ['event-published'] : ['event-draft'],
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
      <div className="bg-white rounded-lg border shadow-sm p-6">
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
            day: 'Dia',
            list: 'Lista'
          }}
          locale="pt-br"
          events={calendarEvents}
          eventClick={handleEventClick}
          selectable={editable}
          select={handleDateSelect}
          editable={editable}
          selectMirror={true}
          dayMaxEvents={4}
          weekends={true}
          nowIndicator={true}
          navLinks={true}
          height="auto"
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          expandRows={true}
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            meridiem: false
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            meridiem: false
          }}
          dayHeaderFormat={{
            weekday: 'short',
            day: 'numeric',
            omitCommas: true
          }}
          views={{
            dayGridMonth: {
              titleFormat: { year: 'numeric', month: 'long' },
              dayMaxEvents: 4
            },
            timeGridWeek: {
              titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
              slotMinTime: '06:00:00',
              slotMaxTime: '23:00:00',
              dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true }
            },
            timeGridDay: {
              titleFormat: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
              slotMinTime: '06:00:00',
              slotMaxTime: '23:00:00'
            }
          }}
          moreLinkText={(num) => `+${num} eventos`}
          noEventsText="Nenhum evento para mostrar"
          allDayText="Dia todo"
          eventMinHeight={35}
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
