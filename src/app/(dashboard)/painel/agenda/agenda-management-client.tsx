'use client'

import { useState } from 'react'
import { AgendaEvent } from '@/types'
import { EventCalendar } from '@/components/agenda/event-calendar'
import { EventDetailModal } from '@/components/agenda/event-detail-modal'
import { EventForm } from '@/components/agenda/event-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AgendaManagementClientProps {
  events: AgendaEvent[]
  tenantId: string
  isStaff: boolean
}

export function AgendaManagementClient({
  events: initialEvents,
  tenantId,
  isStaff,
}: AgendaManagementClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [events, setEvents] = useState(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleSelectEvent = (event: AgendaEvent) => {
    setSelectedEvent(event)
    setDetailModalOpen(true)
  }

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setFormModalOpen(true)
  }

  const handleEditEvent = () => {
    if (selectedEvent) {
      setEditingEvent(selectedEvent)
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

  const handleFormSuccess = () => {
    setFormModalOpen(false)
    setEditingEvent(null)
    router.refresh()
    // Reload events
    window.location.reload()
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (isStaff) {
      // Pre-fill form with selected time slot
      setEditingEvent({
        id: '',
        tenant_id: tenantId,
        title: '',
        description: '',
        location: null,
        start_date: slotInfo.start.toISOString(),
        end_date: slotInfo.end.toISOString(),
        banner_url: null,
        published: false,
        created_at: '',
        updated_at: '',
      })
      setFormModalOpen(true)
    }
  }

  return (
    <>
      {/* Action Buttons */}
      {isStaff && (
        <div className="mb-4 flex justify-end">
          <Button onClick={handleCreateEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      )}

      {/* Calendar */}
      <EventCalendar
        events={events}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={isStaff ? handleSelectSlot : undefined}
        selectable={isStaff}
      />

      {/* Detail Modal with Edit/Delete actions */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <EventDetailModal
                event={selectedEvent}
                open={true}
                onOpenChange={() => {}}
              />

              {isStaff && (
                <div className="mt-4 flex justify-end gap-2 border-t pt-4">
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
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Modal */}
      {isStaff && (
        <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent?.id ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
            </DialogHeader>
            <EventForm
              event={editingEvent}
              tenantId={tenantId}
              onSuccess={handleFormSuccess}
              onCancel={() => setFormModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
