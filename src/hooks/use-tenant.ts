import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole } from '@/types'

interface UseTenantReturn {
  profile: Profile | null
  tenantId: string | null
  role: UserRole
  loading: boolean
  error: Error | null
}

/**
 * Hook para buscar perfil do usuário e informações de tenant
 *
 * Centraliza a lógica de busca de profile/tenant que era repetida
 * em múltiplos componentes.
 *
 * @param userId - ID do usuário autenticado
 *
 * @example
 * const { user } = useAuth()
 * const { profile, tenantId, role, loading } = useTenant(user?.id)
 */
export function useTenant(userId: string | undefined): UseTenantReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole>('cidadao')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    const loadProfile = async () => {
      try {
        const { data, error: profileError } = await supabase
          .from('profile')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileError) throw profileError

        setProfile(data as Profile)
        setTenantId(data.tenant_id)
        setRole(data.role as UserRole)
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load profile')
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [userId])

  return { profile, tenantId, role, loading, error }
}
