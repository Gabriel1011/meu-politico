"use client"

import React from "react"
import DatePicker, { registerLocale } from "react-datepicker"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import "react-datepicker/dist/react-datepicker.css"
import "@/styles/react-datepicker-custom.css"

// Registrar locale português
registerLocale("pt-BR", ptBR)

interface ReactDateTimePickerProps {
  selected?: Date
  onChange: (date: Date | null) => void
  showTimeSelect?: boolean
  dateFormat?: string
  timeFormat?: string
  timeIntervals?: number
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
  required?: boolean
}

export function ReactDateTimePicker({
  selected,
  onChange,
  showTimeSelect = true,
  dateFormat = "dd/MM/yyyy HH:mm",
  timeFormat = "HH:mm",
  timeIntervals = 15,
  placeholder = "Selecione data e hora",
  minDate,
  maxDate,
  className,
  required,
}: ReactDateTimePickerProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <DatePicker
          selected={selected}
          onChange={onChange}
          showTimeSelect={showTimeSelect}
          dateFormat={dateFormat}
          timeFormat={timeFormat}
          timeIntervals={timeIntervals}
          locale="pt-BR"
          minDate={minDate}
          maxDate={maxDate}
          placeholderText={placeholder}
          required={required}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          calendarClassName="!font-sans"
          popperClassName="!z-[9999]"
          wrapperClassName="w-full"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {showTimeSelect && <Clock className="h-4 w-4" />}
        </div>
      </div>
    </div>
  )
}
