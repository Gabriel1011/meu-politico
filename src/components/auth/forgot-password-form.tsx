'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logError } from '@/lib/error-handler'
import { createClient } from '@/lib/supabase/client'

type Status =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; message: string }

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [loading, setLoading] = useState(false)

  const redirectTo = useMemo(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (siteUrl) {
      return `${siteUrl.replace(/\/$/, '')}/recuperar-senha/redefinir`
    }

    if (typeof window !== 'undefined') {
      return `${window.location.origin}/recuperar-senha/redefinir`
    }

    return undefined
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email) {
      setStatus({
        kind: 'error',
        message: 'Informe um e-mail cadastrado para prosseguir.',
      })
      return
    }

    setLoading(true)
    setStatus({ kind: 'idle' })

    try {
      const supabase = createClient()
      const resetOptions = redirectTo ? { redirectTo } : undefined
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        resetOptions
      )

      if (error) throw error

      setStatus({
        kind: 'success',
        message:
          'Enviamos um link de redefinição para o seu e-mail. Verifique sua caixa de entrada e siga as instruções.',
      })
      setEmail('')
    } catch (error) {
      const appError = logError(error, 'ForgotPasswordForm.handleSubmit')
      setStatus({ kind: 'error', message: appError.userMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {status.kind === 'error' && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {status.message}
        </div>
      )}

      {status.kind === 'success' && (
        <div className="rounded-md border border-primary/40 bg-primary/10 p-4 text-sm text-primary">
          {status.message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail cadastrado</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            className="mt-1"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Enviando link...' : 'Receber link de redefinição'}
      </Button>
    </form>
  )
}
