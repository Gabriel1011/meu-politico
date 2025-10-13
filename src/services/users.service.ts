import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profile']['Row']
type ProfileInsert = Database['public']['Tables']['profile']['Insert']
type ProfileUpdate = Database['public']['Tables']['profile']['Update']

export interface UserFilters {
  searchTerm?: string
  role?: Profile['role']
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UserWithAuth {
  id: string
  tenant_id: string | null
  email?: string
  nome_completo: string | null
  avatar_url: string | null
  role: 'cidadao' | 'assessor' | 'politico' | 'admin'
  metadata: any
  created_at: string
  updated_at: string
}

class UsersService {
  private supabase = createClient()

  /**
   * Get paginated users with filters
   */
  async getUsers(
    tenantId: string,
    filters: UserFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 10 }
  ): Promise<PaginatedResponse<UserWithAuth>> {
    const { page, pageSize } = pagination
    const offset = (page - 1) * pageSize

    // Build query
    let query = this.supabase
      .from('profile')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.searchTerm) {
      query = query.ilike('nome_completo', `%${filters.searchTerm}%`)
    }

    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      throw new Error('Erro ao buscar usuários')
    }

    // Map profiles to UserWithAuth (email comes from profile table)
    const usersWithEmail: UserWithAuth[] = (data || []).map((profile) => ({
      ...profile,
      email: profile.email,
    }))

    return {
      data: usersWithEmail,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserWithAuth | null> {
    const { data, error } = await this.supabase
      .from('profile')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    return {
      ...data,
      email: data.email,
    }
  }

  /**
   * Update user profile
   */
  async updateUser(
    id: string,
    updates: Partial<ProfileUpdate>
  ): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profile')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw new Error('Erro ao atualizar usuário')
    }

    return data
  }

  /**
   * Delete user (soft delete by setting active = false)
   */
  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('profile')
      .update({ active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      throw new Error('Erro ao deletar usuário')
    }
  }

  /**
   * Activate/deactivate user
   */
  async toggleUserStatus(id: string, active: boolean): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profile')
      .update({ active })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling user status:', error)
      throw new Error('Erro ao alterar status do usuário')
    }

    return data
  }

  /**
   * Update user role
   */
  async updateUserRole(id: string, role: Profile['role']): Promise<Profile> {
    return this.updateUser(id, { role })
  }

  /**
   * Get users count by role
   */
  async getUsersCountByRole(tenantId: string): Promise<{
    cidadao: number
    assessor: number
    politico: number
  }> {
    const roles: ('cidadao' | 'assessor' | 'politico')[] = ['cidadao', 'assessor', 'politico']
    const counts = await Promise.all(
      roles.map(async (role) => {
        const { count } = await this.supabase
          .from('profile')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('role', role)

        return { role, count: count || 0 }
      })
    )

    return counts.reduce(
      (acc, { role, count }) => ({
        ...acc,
        [role]: count,
      }),
      { cidadao: 0, assessor: 0, politico: 0 }
    )
  }
}

export const usersService = new UsersService()
