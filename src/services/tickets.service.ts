import { createClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/error-handler'
import type { TicketWithRelations, TicketStatus } from '@/types'

/**
 * Filtros para busca de tickets
 */
export interface TicketFilters {
  status?: TicketStatus | TicketStatus[]
  userId?: string
  categoryId?: string
  search?: string
  startDate?: string
  endDate?: string
}

/**
 * Opções para queries de tickets
 */
export interface TicketQueryOptions {
  tenantId: string
  filters?: TicketFilters
  orderBy?: 'created_at' | 'updated_at' | 'ticket_number'
  ascending?: boolean
  limit?: number
  offset?: number
}

/**
 * Dados para criar um ticket
 */
export interface CreateTicketData {
  titulo: string
  descricao: string
  categoria_id?: string
  localizacao?: { bairro?: string }
  fotos?: string[]
}

/**
 * Service para gerenciar tickets
 *
 * Centraliza todas as operações de tickets, removendo a necessidade
 * de fazer queries diretas nos componentes.
 */
class TicketsService {
  private supabase = createClient()

  /**
   * Busca tickets com filtros e paginação
   *
   * @example
   * const tickets = await ticketsService.getTickets({
   *   tenantId: '123',
   *   filters: { status: 'nova', userId: 'user-id' }
   * })
   */
  async getTickets(options: TicketQueryOptions): Promise<TicketWithRelations[]> {
    const {
      tenantId,
      filters = {},
      orderBy = 'created_at',
      ascending = false,
      limit,
      offset,
    } = options

    let query = this.supabase
      .from('tickets')
      .select(
        `
        *,
        profile!tickets_user_id_fkey (
          id,
          nome_completo,
          email,
          avatar_url
        ),
        categories:categoria_id (
          id,
          nome,
          cor,
          icone
        ),
        assigned_user:profile!tickets_assigned_to_fkey (
          id,
          nome_completo,
          avatar_url
        )
      `
      )
      .eq('tenant_id', tenantId)

    // Aplicar filtros
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status)
      } else {
        query = query.eq('status', filters.status)
      }
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters.categoryId) {
      query = query.eq('categoria_id', filters.categoryId)
    }

    if (filters.search) {
      query = query.or(
        `titulo.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`
      )
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    // Aplicar ordenação
    query = query.order(orderBy, { ascending })

    // Aplicar paginação
    if (limit) {
      query = query.limit(limit)
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw handleSupabaseError(error)

    return (data as TicketWithRelations[]) || []
  }

  /**
   * Busca ticket por ID
   *
   * @example
   * const ticket = await ticketsService.getTicketById('ticket-id')
   */
  async getTicketById(id: string): Promise<TicketWithRelations> {
    const { data, error} = await this.supabase
      .from('tickets')
      .select(
        `
        *,
        profile!tickets_user_id_fkey (
          id,
          nome_completo,
          email,
          avatar_url
        ),
        categories:categoria_id (
          id,
          nome,
          cor,
          icone
        ),
        assigned_user:profile!tickets_assigned_to_fkey (
          id,
          nome_completo,
          avatar_url
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) throw handleSupabaseError(error)

    return data as TicketWithRelations
  }

  /**
   * Cria novo ticket
   *
   * @example
   * const ticket = await ticketsService.createTicket(
   *   'tenant-id',
   *   'user-id',
   *   { titulo: 'Buraco na rua', descricao: '...' }
   * )
   */
  async createTicket(
    tenantId: string,
    userId: string,
    ticketData: CreateTicketData
  ) {
    // Gerar número do ticket
    const { data: ticketNumber, error: rpcError } = await this.supabase.rpc(
      'generate_ticket_number',
      { p_tenant_id: tenantId }
    )

    if (rpcError) throw handleSupabaseError(rpcError)

    const { data, error } = await this.supabase
      .from('tickets')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        ticket_number: ticketNumber,
        titulo: ticketData.titulo,
        descricao: ticketData.descricao,
        categoria_id: ticketData.categoria_id || null,
        localizacao: ticketData.localizacao || null,
        fotos: ticketData.fotos || [],
      })
      .select()
      .single()

    if (error) throw handleSupabaseError(error)

    return data
  }

  /**
   * Atualiza status do ticket
   *
   * @example
   * await ticketsService.updateTicketStatus('ticket-id', 'em_andamento')
   */
  async updateTicketStatus(id: string, status: TicketStatus) {
    const { data, error } = await this.supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw handleSupabaseError(error)

    return data
  }

  /**
   * Atribui ticket a um usuário (assign)
   *
   * @example
   * await ticketsService.assignTicket('ticket-id', 'user-id')
   * await ticketsService.assignTicket('ticket-id', null) // Remove assignment
   */
  async assignTicket(id: string, assignedTo: string | null) {
    const { data, error } = await this.supabase
      .from('tickets')
      .update({ assigned_to: assignedTo })
      .eq('id', id)
      .select()
      .single()

    if (error) throw handleSupabaseError(error)

    return data
  }

  /**
   * Atualiza dados do ticket
   *
   * @example
   * await ticketsService.updateTicket('ticket-id', {
   *   titulo: 'Novo título',
   *   descricao: 'Nova descrição'
   * })
   */
  async updateTicket(id: string, updates: Partial<CreateTicketData>) {
    const { data, error } = await this.supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw handleSupabaseError(error)

    return data
  }

  /**
   * Deleta ticket
   *
   * @example
   * await ticketsService.deleteTicket('ticket-id')
   */
  async deleteTicket(id: string): Promise<void> {
    const { error } = await this.supabase.from('tickets').delete().eq('id', id)

    if (error) throw handleSupabaseError(error)
  }

  /**
   * Conta tickets por status
   *
   * @example
   * const counts = await ticketsService.getTicketCounts('tenant-id')
   * console.log(counts) // { total: 100, open: 50, resolved: 30 }
   */
  async getTicketCounts(
    tenantId: string,
    userId?: string
  ): Promise<{ total: number; open: number; resolved: number }> {
    let baseQuery = this.supabase
      .from('tickets')
      .select('status', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)

    if (userId) {
      baseQuery = baseQuery.eq('user_id', userId)
    }

    const [totalResult, openResult, resolvedResult] = await Promise.all([
      baseQuery,
      this.supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .in('status', ['nova', 'em_analise', 'em_andamento'])
        .then((res) => (userId ? res.eq('user_id', userId) : res)),
      this.supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'resolvida')
        .then((res) => (userId ? res.eq('user_id', userId) : res)),
    ])

    return {
      total: totalResult.count || 0,
      open: openResult.count || 0,
      resolved: resolvedResult.count || 0,
    }
  }

  /**
   * Faz upload de imagem para storage
   *
   * @example
   * const url = await ticketsService.uploadImage(file, 'tenant-id', 'user-id')
   */
  async uploadImage(file: File, tenantId: string, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `${tenantId}/tickets/${fileName}`

    const { error: uploadError } = await this.supabase.storage
      .from('uploads')
      .upload(filePath, file)

    if (uploadError) throw handleSupabaseError(uploadError)

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('uploads').getPublicUrl(filePath)

    return publicUrl
  }

  /**
   * Faz upload de múltiplas imagens
   *
   * @example
   * const urls = await ticketsService.uploadImages(files, 'tenant-id', 'user-id')
   */
  async uploadImages(files: File[], tenantId: string, userId: string): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, tenantId, userId))
    return Promise.all(uploadPromises)
  }

  /**
   * Busca membros da equipe (staff) para assign
   *
   * @example
   * const staff = await ticketsService.getStaffMembers('tenant-id')
   */
  async getStaffMembers(tenantId: string) {
    const { data, error } = await this.supabase
      .from('profile')
      .select('id, nome_completo, avatar_url, role')
      .eq('tenant_id', tenantId)
      .in('role', ['assessor', 'vereador', 'admin'])
      .order('nome_completo')

    if (error) throw handleSupabaseError(error)

    return data
  }
}

// Exportar instância única (singleton)
export const ticketsService = new TicketsService()
