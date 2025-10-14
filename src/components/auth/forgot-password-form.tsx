'use client'

import { useMemo, useState } from 'react'
import { Loader2, Mail, AlertCircle, CheckCircle2, Send } from 'lucide-react'

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
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {status.kind === 'error' && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-800">{status.message}</p>
        </div>
      )}

      {status.kind === 'success' && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-900">Link enviado com sucesso!</p>
            <p className="text-sm text-emerald-700">{status.message}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">
          E-mail cadastrado
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            className="h-12 pl-11 text-base transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enviaremos um link seguro para este endereço de e-mail.
        </p>
      </div>

      <Button
        type="submit"
        className="h-12 w-full text-base font-semibold shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Enviando link...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Send className="h-4 w-4" />
            Receber link de redefinição
          </span>
        )}
      </Button>
    </form>
  )
}
