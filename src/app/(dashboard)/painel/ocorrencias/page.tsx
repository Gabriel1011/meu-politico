'use client'

import { useState } from 'react'
import { List, LayoutGrid, Plus, X } from 'lucide-react'
import { TicketList } from '@/components/tickets/ticket-list'
import { TicketKanban } from '@/components/tickets/ticket-kanban'
import { TicketForm } from '@/components/tickets/ticket-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUserContext } from '@/hooks/use-user-context'
import { useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'

export default function OcorrenciasPage() {
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const { role } = useUserContext()
  const sidebarCollapsed = useSidebar()

  const handleCreateSuccess = () => {
    setIsCreateOpen(false)
    setRefreshToken((prev) => prev + 1)
  }

  const openCreateDialog = () => setIsCreateOpen(true)

  return (
    <>
      {view === 'kanban' ? (
        /* Kanban Mode - Full viewport layout */
        <div
          className={cn(
            'fixed inset-0 z-10 bg-background transition-all duration-300',
            'lg:left-64', // Default: expanded sidebar
            sidebarCollapsed && 'lg:left-16' // Collapsed sidebar
          )}
          style={{ top: '64px' }}
        >
          <div className="flex flex-col h-full">
            {/* Action Buttons */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-background">
              <h1 className="text-3xl font-bold">Ocorrências</h1>
              <div className="flex flex-wrap items-center gap-2">
                {role === 'cidadao' && (
                  <Button className="gap-2" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4" />
                    Nova ocorrência
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setView('list')}
                    className="gap-2"
                  >
                    <List className="h-4 w-4" />
                    Lista
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setView('kanban')}
                    className="gap-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Kanban
                  </Button>
                </div>
              </div>
            </div>

            {/* Kanban Content - Full height */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="h-full">
                <TicketKanban refreshToken={refreshToken} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List Mode - Normal container layout */
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold">Ocorrências</h1>
            <div className="flex flex-wrap items-center gap-2">
              {role === 'cidadao' && (
                <Button className="gap-2" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4" />
                  Nova ocorrência
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => setView('list')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  Lista
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setView('kanban')}
                  className="gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Kanban
                </Button>
              </div>
            </div>
          </div>

          <TicketList
            refreshToken={refreshToken}
            onCreateRequest={openCreateDialog}
          />
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl w-full">
          <button
            type="button"
            onClick={() => setIsCreateOpen(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader>
            <DialogTitle>Registrar nova ocorrência</DialogTitle>
            <DialogDescription>
              Descreva o problema ou demanda que você gostaria de reportar. Nossa
              equipe será notificada imediatamente.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto pr-2">
            <TicketForm onSuccess={handleCreateSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
