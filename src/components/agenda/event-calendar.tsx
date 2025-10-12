'use client'

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { AgendaEvent } from '@/types'
import { useState } from 'react'

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: AgendaEvent
}

interface EventCalendarProps {
  events: AgendaEvent[]
  onSelectEvent?: (event: AgendaEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  defaultView?: View
  selectable?: boolean
}

const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+ ${total} mais`,
}

export function EventCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
  defaultView = 'month',
  selectable = false,
}: EventCalendarProps) {
  const [view, setView] = useState<View>(defaultView)
  const [date, setDate] = useState(new Date())

  // Convert AgendaEvent to CalendarEvent
  const calendarEvents: CalendarEvent[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    resource: event,
  }))

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event.resource)
    }
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo)
    }
  }

  return (
    <div className="h-[600px] rounded-lg border bg-card p-4">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        culture="pt-BR"
        messages={messages}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable={selectable}
        popup
        views={['month', 'week', 'day']}
        style={{ height: '100%' }}
        className="rbc-calendar"
      />
    </div>
  )
}
