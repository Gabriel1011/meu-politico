import { useAuth } from './use-auth'
import { useTenant } from './use-tenant'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'

interface UseUserContextReturn {
  user: User | null
  profile: Profile | null
  tenantId: string | null
  role: UserRole
  loading: boolean
  error: Error | null
  isAuthenticated: boolean
  isStaff: boolean
  isCitizen: boolean
}

/**
 * Hook combinado para acessar contexto completo do usuário
 *
 * Combina autenticação (useAuth) e tenant (useTenant) em um único hook.
 * Este é o hook principal que deve ser usado na maioria dos componentes.
 *
 * @example
 * const { user, tenantId, role, isStaff, loading } = useUserContext()
 *
 * if (loading) return <LoadingSkeleton />
 * if (!user) return <Unauthorized />
 *
 * return (
 *   <div>
 *     {isStaff && <StaffOnlyButton />}
 *   </div>
 * )
 */
export function useUserContext(): UseUserContextReturn {
  const { user, loading: authLoading, error: authError } = useAuth()
  const {
    profile,
    tenantId,
    role,
    loading: tenantLoading,
    error: tenantError,
  } = useTenant(user?.id)

  const loading = authLoading || tenantLoading
  const error = authError || tenantError

  const isAuthenticated = !!user
  const isStaff = ['assessor', 'politico', 'admin'].includes(role)
  const isCitizen = role === 'cidadao'

  return {
    user,
    profile,
    tenantId,
    role,
    loading,
    error,
    isAuthenticated,
    isStaff,
    isCitizen,
  }
}
