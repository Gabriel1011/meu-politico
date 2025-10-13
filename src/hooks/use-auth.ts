import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: Error | null
}

/**
 * Hook para gerenciar autenticação do usuário
 *
 * Centraliza a lógica de autenticação e subscribe para mudanças
 * de estado de autenticação.
 *
 * @example
 * const { user, loading, error } = useAuth()
 *
 * if (loading) return <LoadingSkeleton />
 * if (error) return <ErrorMessage error={error} />
 * if (!user) return <Unauthorized />
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Buscar usuário inicial
    const loadUser = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser()

        if (authError) throw authError
        setUser(data.user)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown auth error'))
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Subscribe para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
