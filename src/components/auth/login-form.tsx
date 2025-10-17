'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { logError } from '@/lib/error-handler'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      console.log('✅ [Login] Cliente Supabase criado')

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('📊 [Login] Resposta do Supabase:', { data, error: signInError })

      if (signInError) {
        console.error('❌ [Login] Erro do Supabase:', signInError)
        throw signInError
      }

      console.log('✅ [Login] Autenticação bem-sucedida, redirecionando...')

      router.push('/painel')
      router.refresh()
    } catch (err) {
      console.error('💥 [Login] Erro capturado:', err)
      const appError = logError(err, 'LoginForm.handleSubmit')
      console.error('📝 [Login] Mensagem de erro processada:', appError.userMessage)
      setError(appError.userMessage)
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              E-mail
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-12 pl-11 text-base transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 pl-11 text-base transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end text-sm">
          <a
            href="/recuperar-senha"
            className="group inline-flex items-center gap-1 font-semibold text-primary transition-all hover:gap-2 hover:text-primary/90"
          >
            Esqueceu sua senha?
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <Button
          type="submit"
          className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Entrando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Entrar
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
