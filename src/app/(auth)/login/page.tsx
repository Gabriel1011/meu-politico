import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

import { LoginForm } from '@/components/auth/login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Meu Político',
  description: 'Acesse sua conta',
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-background px-4 py-8 animate-in fade-in duration-500">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-gradient-to-tl from-primary/10 to-violet-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-3xl" />
      </div>

      {/* Logo link - positioned absolutely at top */}
      <Link
        href="/"
        className="group absolute left-8 top-8 inline-flex items-center gap-3 rounded-2xl border border-primary/10 bg-white/60 px-4 py-2 shadow-sm backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-white/80 hover:shadow-md"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-white shadow-sm">
          MP
        </span>
        <span className="flex flex-col items-start">
          <span className="text-xs font-bold text-primary">Meu Político</span>
          <span className="text-[10px] text-muted-foreground">Governança municipal</span>
        </span>
      </Link>

      {/* Centered login card */}
      <div className="relative w-full max-w-md">
        <div className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white/90 p-8 shadow-2xl backdrop-blur-xl transition-all hover:shadow-3xl sm:p-10">
          {/* Decorative gradient */}
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 blur-3xl transition-all group-hover:scale-110" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-blue-500/10 to-primary/10 blur-3xl transition-all group-hover:scale-110" />

          <div className="relative">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Acesse sua conta
              </h2>
              <p className="text-sm text-muted-foreground">
                Utilize suas credenciais cadastradas para continuar.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
