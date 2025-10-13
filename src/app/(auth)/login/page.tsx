import Link from 'next/link'
import { ShieldCheck, Headset, Sparkles } from 'lucide-react'

import { LoginForm } from '@/components/auth/login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Meu Político',
  description: 'Acesse sua conta',
}

export default function LoginPage() {
  const highlights = [
    {
      label: 'Dados protegidos',
      value: 'Segurança integrada',
      description: 'Criptografia ponta a ponta e políticas de acesso auditáveis.',
      icon: ShieldCheck,
      accent: 'bg-primary/45',
    },
    {
      label: 'Suporte',
      value: 'Equipe dedicada',
      description: 'Especialistas disponíveis para orientar cada passo.',
      icon: Headset,
      accent: 'bg-primary/25',
    },
    {
      label: 'Atualizações',
      value: 'Melhorias contínuas',
      description: 'Novos recursos entregues com transparência e previsibilidade.',
      icon: Sparkles,
      accent: 'bg-primary/20',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/40 via-background to-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-12">
        <div className="mb-12 flex w-full flex-col gap-12 lg:mb-0 lg:w-1/2 lg:gap-16">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-foreground transition hover:text-primary sm:text-sm"
            >
              <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] uppercase tracking-widest text-primary sm:text-xs">
                Meu Político
              </span>
              <span className="text-muted-foreground">
                Governança municipal em um só lugar
              </span>
            </Link>
          </header>

          <div className="space-y-8">
            <div className="space-y-4 text-center sm:text-left">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Acesso à plataforma.
              </h1>
              <p className="mx-auto max-w-lg text-sm text-muted-foreground sm:mx-0 sm:text-base">
                Acompanhe agendas, proposições e indicadores estratégicos em
                tempo real em um ambiente projetado para equipes parlamentares.
              </p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-2xl border border-primary/10 bg-card/90 p-5 shadow-sm shadow-primary/5 transition hover:-translate-y-0.5 hover:shadow-lg backdrop-blur-sm sm:p-6"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-6 top-3 h-8 rounded-full ${item.accent} blur-3xl`}
                    />
                    <div className="relative flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {item.label}
                      </dt>
                    </div>
                    <dd className="relative mt-4 text-lg font-semibold text-foreground">
                      {item.value}
                    </dd>
                    <p className="relative mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>

        <div className="w-full max-w-lg">
          <div className="rounded-3xl border border-primary/10 bg-card/80 p-6 shadow-xl shadow-primary/10 backdrop-blur-lg sm:p-8">
            <div className="space-y-3 text-center sm:space-y-4">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Acesse sua conta
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
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
