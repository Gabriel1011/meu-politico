'use client'

import { useState } from 'react'
import { TicketList } from '@/components/tickets/ticket-list'
import { TicketKanban } from '@/components/tickets/ticket-kanban'
import { Button } from '@/components/ui/button'

export default function OcorrenciasPage() {
  const [view, setView] = useState<'list' | 'kanban'>('list')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ocorrências</h1>
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
          >
            📋 Lista
          </Button>
          <Button
            variant={view === 'kanban' ? 'default' : 'outline'}
            onClick={() => setView('kanban')}
          >
            📊 Kanban
          </Button>
        </div>
      </div>

      {view === 'list' ? <TicketList /> : <TicketKanban />}
    </div>
  )
}
