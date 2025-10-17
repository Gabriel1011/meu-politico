'use client'

import { useState } from 'react'
import { AgendaEvent } from '@/types'
import { EventCalendar } from '@/components/agenda/event-calendar'
import { EventList } from '@/components/agenda/event-list'
import { EventDetailModal } from '@/components/agenda/event-detail-modal'
import { EventForm } from '@/components/agenda/event-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, List, Calendar as CalendarIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'calendar'

interface AgendaManagementClientProps {
  events: AgendaEvent[]
  tenantId: string
  isStaff: boolean
  headerTitle?: string
  headerDescription?: string
}

export function AgendaManagementClient({
  events: initialEvents,
  tenantId,
  isStaff,
  headerTitle,
  headerDescription,
}: AgendaManagementClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const sidebarCollapsed = useSidebar()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [events, setEvents] = useState(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleSelectEvent = (event: AgendaEvent) => {
    setSelectedEvent(event)
    setDetailModalOpen(true)
  }

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setSelectedSlot(null)
    setFormModalOpen(true)
  }

  const handleEditEvent = () => {
    if (selectedEvent) {
      setEditingEvent(selectedEvent)
      setSelectedSlot(null)
      setDetailModalOpen(false)
      setFormModalOpen(true)
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !confirm('Tem certeza que deseja excluir este evento?')) {
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id)

      if (error) throw error

      // Update local state
      setEvents(events.filter((e) => e.id !== selectedEvent.id))
      setDetailModalOpen(false)
      setSelectedEvent(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Erro ao excluir evento')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormSuccess = async () => {
    setFormModalOpen(false)
    setEditingEvent(null)

    // Reload events from server
    try {
      const { data: updatedEvents } = await supabase
        .from('events')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('start_date', { ascending: false })

      if (updatedEvents) {
        setEvents(updatedEvents)
      }
    } catch (error) {
      console.error('Error reloading events:', error)
    }

    router.refresh()
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (isStaff) {
      // Store selected slot for pre-filling form
      setSelectedSlot(slotInfo)
      setEditingEvent(null)
      setFormModalOpen(true)
    }
  }

  return (
    <>
      {viewMode === 'calendar' ? (
        /* Calendar Mode - Full viewport layout */
        <div
          className={cn(
            'fixed inset-0 z-10 bg-background transition-all duration-300',
            'lg:left-64', // Default: expanded sidebar
            sidebarCollapsed && 'lg:left-16' // Collapsed sidebar
          )}
          style={{ top: '64px' }}
        >
          <div className="flex flex-col h-full">
            {/* Action Buttons - single line at top */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-background">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="mr-2 h-4 w-4" />
                  Lista
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Calendário
                </Button>
              </div>

              {isStaff && (
                <Button onClick={handleCreateEvent}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Evento
                </Button>
              )}
            </div>

            {/* Calendar Content - Full height */}
            <div className="flex-1 p-6 overflow-hidden">
              <EventCalendar
                events={events}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={isStaff ? handleSelectSlot : undefined}
                selectable={isStaff}
              />
            </div>
          </div>
        </div>
      ) : (
        /* List Mode - Normal container layout */
        <div className="flex flex-col h-full">
          {/* Header */}
          {headerTitle && (
            <div className="mb-4">
              <h1 className="text-3xl font-bold">{headerTitle}</h1>
              {headerDescription && (
                <p className="text-muted-foreground text-sm">{headerDescription}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="mr-2 h-4 w-4" />
                Lista
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Calendário
              </Button>
            </div>

            {isStaff && (
              <Button onClick={handleCreateEvent}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Button>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 min-h-0 overflow-auto">
            <EventList events={events} onEventClick={handleSelectEvent} />
          </div>
        </div>
      )}

      {/* Detail Modal with Edit/Delete actions */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          actions={
            isStaff ? (
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={handleEditEvent}
                  disabled={deleting}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteEvent}
                  disabled={deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </Button>
              </div>
            ) : undefined
          }
        />
      )}

      {/* Form Modal */}
      {isStaff && (
        <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent?.id ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
            </DialogHeader>
            <EventForm
              event={editingEvent}
              tenantId={tenantId}
              initialStartDate={selectedSlot?.start}
              initialEndDate={selectedSlot?.end}
              onSuccess={handleFormSuccess}
              onCancel={() => setFormModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
