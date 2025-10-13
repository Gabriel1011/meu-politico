'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logError } from '@/lib/error-handler'
import { createClient } from '@/lib/supabase/client'

type Status =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; message: string }

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password.length < 8) {
      setStatus({
        kind: 'error',
        message: 'A nova senha deve ter pelo menos 8 caracteres.',
      })
      return
    }

    if (password !== confirmPassword) {
      setStatus({
        kind: 'error',
        message: 'As senhas informadas são diferentes.',
      })
      return
    }

    setLoading(true)
    setStatus({ kind: 'idle' })

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setStatus({
        kind: 'success',
        message: 'Senha atualizada com sucesso. Você já pode acessar a plataforma.',
      })

      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        router.push('/login')
      }, 1200)
    } catch (error) {
      const appError = logError(error, 'ResetPasswordForm.handleSubmit')
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
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Use no mínimo 8 caracteres e combine letras, números e símbolos.
          </p>
        </div>

        <div>
          <Label htmlFor="confirm-password">Confirme a nova senha</Label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            className="mt-1"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Atualizando senha...' : 'Salvar nova senha'}
      </Button>
    </form>
  )
}
