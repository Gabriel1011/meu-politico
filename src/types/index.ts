import { Database } from './database.types'

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// Main entity types
export type Tenant = Tables<'tenants'>
export type Profile = Tables<'profile'>
export type Category = Tables<'categories'>
export type Ticket = Tables<'tickets'>
export type TicketComment = Tables<'ticket_comments'>
export type Event = Tables<'events'>

// Legacy alias for backwards compatibility during migration
export type AgendaEvent = Event

// Extended types with relations
export type TicketWithRelations = Ticket & {
  profile?: Pick<Profile, 'id' | 'nome_completo' | 'email'>
  categories?: Pick<Category, 'id' | 'nome' | 'cor'>
}

export type TicketCommentWithAuthor = TicketComment & {
  profile?: Pick<Profile, 'id' | 'nome_completo' | 'avatar_url'>
}

// User roles
export type UserRole = 'cidadao' | 'assessor' | 'politico' | 'admin'

// Ticket status
export type TicketStatus =
  | 'nova'
  | 'em_analise'
  | 'em_andamento'
  | 'resolvida'
  | 'encerrada'
  | 'cancelada'

export type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente'

// UI Constants (in Portuguese for display)
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  nova: 'Nova',
  em_analise: 'Em Análise',
  em_andamento: 'Em Andamento',
  resolvida: 'Resolvida',
  encerrada: 'Encerrada',
  cancelada: 'Cancelada',
}

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  nova: 'bg-blue-100 text-blue-800',
  em_analise: 'bg-yellow-100 text-yellow-800',
  em_andamento: 'bg-purple-100 text-purple-800',
  resolvida: 'bg-green-100 text-green-800',
  encerrada: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800',
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  cidadao: 'Cidadão',
  assessor: 'Assessor',
  politico: 'Político',
  admin: 'Administrador',
}
