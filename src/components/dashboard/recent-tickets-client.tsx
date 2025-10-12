'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { TicketDetailModal } from '@/components/tickets/ticket-detail-modal'
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

const statusColors = {
  nova: 'bg-blue-100 text-blue-800',
  em_analise: 'bg-yellow-100 text-yellow-800',
  em_andamento: 'bg-purple-100 text-purple-800',
  resolvida: 'bg-green-100 text-green-800',
  encerrada: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800',
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
        <div className="hidden md:block rounded-lg border bg-white">
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
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          statusColors[ticket.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusLabels[ticket.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(ticket.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile - Cards */}
        <div className="md:hidden space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => handleTicketClick(ticket.id)}
              className="block cursor-pointer"
            >
              <div className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-all active:scale-98 touch-manipulation">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Protocolo #{ticket.ticket_number}
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {ticket.titulo}
                    </h3>
                  </div>
                  <span
                    className={`ml-2 shrink-0 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusColors[ticket.status as keyof typeof statusColors]
                    }`}
                  >
                    {statusLabels[ticket.status as keyof typeof statusLabels]}
                  </span>
                </div>

                {/* Informações do Card */}
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <span className="truncate">
                      {ticket.categories?.nome || 'Sem categoria'}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-gray-600">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{formatDateTime(ticket.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
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
