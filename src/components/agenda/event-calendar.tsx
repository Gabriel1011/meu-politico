'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core'
import type { Database } from '@/types/database.types'
import './full-calendar.css'

type Event = Database['public']['Tables']['events']['Row']

interface EventCalendarProps {
  events: Event[]
  onSelectEvent?: (event: Event) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  selectable?: boolean
}

export function EventCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
  selectable = false,
}: EventCalendarProps) {
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

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event.extendedProps as Event
    onSelectEvent?.(event)
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    onSelectSlot?.({ start: selectInfo.start, end: selectInfo.end })
  }

  return (
    <div className="h-full rounded-lg border bg-card p-6">
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
        selectable={selectable}
        select={handleDateSelect}
        editable={false}
        selectMirror={true}
        dayMaxEvents={4}
        weekends={true}
        nowIndicator={true}
        navLinks={true}
        height="100%"
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
  )
}
