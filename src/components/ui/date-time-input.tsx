"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimeInputProps {
  date?: Date
  time?: string
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: string) => void
  placeholder?: string
  label?: string
  required?: boolean
}

export function DateTimeInput({
  date,
  time: timeProp,
  onDateChange,
  onTimeChange,
  placeholder = "Selecione a data",
  label,
  required = false,
}: DateTimeInputProps) {
  const time = timeProp || (date ? format(date, "HH:mm") : "09:00")

  return (
    <div className="flex gap-2">
      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal h-10",
              !date && "text-muted-foreground"
            )}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          style={{ zIndex: 9999 }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      {/* Time Input */}
      <div className="flex-shrink-0">
        <Input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          required={required}
          className="w-[130px]"
        />
      </div>
    </div>
  )
}
