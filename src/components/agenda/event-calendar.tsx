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
    backgroundColor: event.published ? '#0D47A1' : '#9E9E9E',
    borderColor: event.published ? '#1976D2' : '#BDBDBD',
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
    <div className="h-[600px] rounded-lg border bg-card p-4">
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
        selectable={selectable}
        select={handleDateSelect}
        editable={false}
        height="100%"
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
  )
}
