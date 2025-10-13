import Link from 'next/link'
import { ShieldCheck, Users, RefreshCcw } from 'lucide-react'

export default function Home() {
  const highlights = [
    {
      label: 'Painéis completos',
      value: '+30 módulos',
      description: 'Visão integrada das principais áreas da gestão municipal.',
      icon: ShieldCheck,
      accent: 'bg-primary/15',
    },
    {
      label: 'Engajamento',
      value: '92% satisfação',
      description: 'Experiência otimizada para vereadores, equipes e cidadãos.',
      icon: Users,
      accent: 'bg-primary/10',
    },
    {
      label: 'Suporte dedicado',
      value: '24/7',
      description: 'Atendimento humano com SLA garantido para incidentes.',
      icon: RefreshCcw,
      accent: 'bg-primary/5',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary/40 via-background to-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8 sm:px-6 lg:px-12 lg:py-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary sm:text-xs">
              Meu Político
            </span>
            <span className="text-xs text-muted-foreground sm:text-sm">
              Gestão pública com transparência
            </span>
          </div>
          <Link
            href="/login"
            className="self-start rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-auto"
          >
            Entrar
          </Link>
        </header>

        <section className="flex flex-1 items-center pt-10 sm:pt-12 lg:pt-16">
          <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12">
            <div className="space-y-8">
              <div className="space-y-4 text-center sm:text-left">
                <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary sm:mx-0 sm:text-sm">
                  Plataforma integrada para municípios
                </span>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  Conecte políticos e cidadãos com informação confiável.
                </h1>
                <p className="mx-auto max-w-xl text-base text-muted-foreground sm:mx-0 sm:text-lg">
                  Simplifique a comunicação com a população, organize pautas e
                  acompanhe compromissos em um ambiente digital pensado para
                  câmaras municipais modernas.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href="/login"
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto"
                >
                  Acessar plataforma
                </Link>
                <span className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
                  Acesso exclusivo para equipes autorizadas da câmara municipal.
                </span>
              </div>

              <dl className="grid gap-4 sm:grid-cols-3">
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
                      <dd className="relative mt-4 text-2xl font-semibold text-foreground">
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

            <div className="relative">
              <div className="absolute -top-10 -left-10 hidden h-52 w-52 rounded-full bg-primary/10 blur-3xl sm:block lg:h-64 lg:w-64" />
              <div className="rounded-3xl border border-primary/10 bg-card/80 p-5 shadow-xl shadow-primary/10 backdrop-blur-lg sm:p-6 lg:p-8">
                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                      Visão unificada
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Monitoramento centralizado das pautas, agendas e
                      indicadores em tempo real.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:gap-4">
                    <div className="rounded-2xl bg-secondary/60 p-4">
                      <p className="text-sm font-medium text-foreground">
                        Agenda integrada
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Visualize eventos oficiais, plenárias e reuniões em uma
                        única timeline.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-secondary/60 p-4">
                      <p className="text-sm font-medium text-foreground">
                        Portal cidadão
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Facilite o acesso da população às propostas em debate e
                        aos resultados das votações.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-secondary/60 p-4">
                      <p className="text-sm font-medium text-foreground">
                        Comunicação direta
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Crie canais oficiais com notificações configuráveis e
                        feedback seguro.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-12 flex flex-col items-start gap-1 text-[10px] text-muted-foreground sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
          <span>
            © {new Date().getFullYear()} Meu Político. Todos os direitos reservados.
          </span>
          <span>Desenvolvido para fortalecer a governança municipal.</span>
        </footer>
      </div>
    </main>
  )
}
