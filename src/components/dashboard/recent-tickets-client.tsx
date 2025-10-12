'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { TicketDetailModal } from '@/components/tickets/ticket-detail-modal'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/types'

interface Ticket {
  id: string
  ticket_number: string
  titulo: string
  status: string
  created_at: string
  profile: any
  categories: any
}

interface RecentTicketsClientProps {
  tickets: Ticket[]
  role: string
}

const statusVariants = {
  nova: 'info' as const,
  em_analise: 'warning' as const,
  em_andamento: 'default' as const,
  resolvida: 'success' as const,
  encerrada: 'secondary' as const,
  cancelada: 'destructive' as const,
}

const statusLabels = {
  nova: 'Nova',
  em_analise: 'Em Análise',
  em_andamento: 'Em Andamento',
  resolvida: 'Resolvida',
  encerrada: 'Encerrada',
  cancelada: 'Cancelada',
}

export function RecentTicketsClient({ tickets, role }: RecentTicketsClientProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">Ocorrências Recentes</h2>
          <Link
            href="/painel/ocorrencias"
            className="text-sm text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {/* Desktop - Tabela */}
        <Card className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Protocolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => handleTicketClick(ticket.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ticket.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.categories?.nome || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusVariants[ticket.status as keyof typeof statusVariants]}>
                        {statusLabels[ticket.status as keyof typeof statusLabels]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(ticket.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mobile - Cards */}
        <div className="md:hidden space-y-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              onClick={() => handleTicketClick(ticket.id)}
              className="cursor-pointer hover:shadow-md transition-all active:scale-98 touch-manipulation"
            >
              <div className="p-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Protocolo #{ticket.ticket_number}
                    </p>
                    <h3 className="text-sm font-semibold line-clamp-2">
                      {ticket.titulo}
                    </h3>
                  </div>
                  <Badge
                    variant={statusVariants[ticket.status as keyof typeof statusVariants]}
                    className="ml-2 shrink-0"
                  >
                    {statusLabels[ticket.status as keyof typeof statusLabels]}
                  </Badge>
                </div>

                {/* Informações do Card */}
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  {ticket.categories?.nome && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: ticket.categories.cor,
                        color: ticket.categories.cor,
                        backgroundColor: `${ticket.categories.cor}15`
                      }}
                    >
                      {ticket.categories.nome}
                    </Badge>
                  )}

                  <span className="text-xs text-muted-foreground">
                    📅 {formatDateTime(ticket.created_at)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <TicketDetailModal
        ticketId={selectedTicketId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        userRole={role as UserRole}
      />
    </>
  )
}
