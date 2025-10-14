import Link from 'next/link'
import {
  ShieldCheck,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Bell,
  FileText,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TestimonialsCarousel } from '@/components/landing/testimonials-carousel'

export default function Home() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Sistema de Ocorrências',
      description:
        'Gerencie solicitações dos cidadãos com sistema de tickets, categorização e acompanhamento em tempo real.',
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Calendar,
      title: 'Agenda Integrada',
      description:
        'Organize eventos, reuniões e compromissos com visualização em calendário e notificações automáticas.',
      color: 'text-violet-600',
      bg: 'bg-violet-500/10',
    },
    {
      icon: Bell,
      title: 'Notificações Inteligentes',
      description:
        'Sistema de alertas personalizados para manter sua equipe sempre informada sobre atualizações importantes.',
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Analítico',
      description:
        'Visualize métricas e indicadores estratégicos com gráficos interativos e relatórios detalhados.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Users,
      title: 'Gestão de Equipe',
      description:
        'Controle de acesso baseado em papéis, delegação de tarefas e acompanhamento de responsabilidades.',
      color: 'text-rose-600',
      bg: 'bg-rose-500/10',
    },
    {
      icon: FileText,
      title: 'Documentação Centralizada',
      description:
        'Armazene e organize documentos oficiais, propostas legislativas e atas de forma segura.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-500/10',
    },
  ]

  const plans = [
    {
      name: 'Essencial',
      price: 250,
      description: 'Perfeito para começar a digitalizar seu gabinete',
      badge: null,
      features: [
        'Até 3 usuários',
        'Sistema de ocorrências',
        'Agenda básica',
        '500 tickets/mês',
        'Suporte por e-mail',
        'Dashboard básico',
        '5 GB de armazenamento',
        'Relatórios mensais',
      ],
      highlighted: false,
      color: 'from-blue-500 to-blue-600',
      buttonVariant: 'outline' as const,
    },
    {
      name: 'Profissional',
      price: 500,
      description: 'Ideal para gabinetes estabelecidos',
      badge: 'Mais Popular',
      features: [
        'Até 10 usuários',
        'Sistema de ocorrências completo',
        'Agenda avançada com integrações',
        'Tickets ilimitados',
        'Suporte prioritário (chat)',
        'Dashboard avançado com BI',
        '50 GB de armazenamento',
        'Relatórios personalizados',
        'API de integração',
        'Notificações por SMS',
        'Área do cidadão personalizada',
      ],
      highlighted: true,
      color: 'from-violet-500 to-purple-600',
      buttonVariant: 'default' as const,
    },
    {
      name: 'Enterprise',
      price: 1000,
      description: 'Para grandes equipes e múltiplos gabinetes',
      badge: 'Completo',
      features: [
        'Usuários ilimitados',
        'Todos os recursos Profissional',
        'Multi-tenancy (vários gabinetes)',
        'Tickets ilimitados + prioridade',
        'Suporte dedicado 24/7',
        'Dashboard executivo customizado',
        '500 GB de armazenamento',
        'White-label (marca própria)',
        'Integrações customizadas',
        'Treinamento presencial',
        'SLA garantido 99,9%',
        'Gerente de conta dedicado',
      ],
      highlighted: false,
      color: 'from-amber-500 to-orange-600',
      buttonVariant: 'outline' as const,
    },
  ]

  const stats = [
    { label: 'Gabinetes ativos', value: '150+' },
    { label: 'Tickets processados', value: '50k+' },
    { label: 'Satisfação', value: '98%' },
    { label: 'Uptime', value: '99.9%' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <span className="text-lg font-bold text-white">MP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">Meu Político</span>
              <span className="text-[10px] text-muted-foreground">Gestão Municipal</span>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              Recursos
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              Planos
            </a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              Depoimentos
            </a>
          </nav>
          <Link href="/login">
            <Button className="shadow-lg shadow-primary/25">
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-4 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 blur-3xl" />
          <div className="absolute -right-4 top-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left side - Content */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Plataforma SaaS Multi-Tenant</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                  Conecte políticos e cidadãos com{' '}
                  <span className="bg-gradient-to-r from-primary via-violet-600 to-purple-600 bg-clip-text text-transparent">
                    inteligência
                  </span>
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  A plataforma completa para gestão de gabinetes parlamentares. Organize ocorrências, agendas e
                  comunicação com os cidadãos em um único lugar.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="#pricing">
                  <Button size="lg" className="w-full shadow-xl shadow-primary/30 sm:w-auto">
                    <Zap className="mr-2 h-5 w-5" />
                    Ver planos
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Fazer login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-4 sm:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Visual */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-violet-500/20 blur-2xl" />
              <div className="relative space-y-4 rounded-3xl border border-gray-200/80 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg" />
                    <div>
                      <p className="text-sm font-semibold">Dashboard Político</p>
                      <p className="text-xs text-muted-foreground">Visão geral do gabinete</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">Ocorrências Ativas</span>
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-bold">127</p>
                    <p className="mt-1 text-xs text-muted-foreground">+23% este mês</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-emerald-500/10 p-4">
                      <CheckCircle className="mb-2 h-5 w-5 text-emerald-600" />
                      <p className="text-xl font-bold">89</p>
                      <p className="text-xs text-muted-foreground">Resolvidas</p>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 p-4">
                      <Clock className="mb-2 h-5 w-5 text-amber-600" />
                      <p className="text-xl font-bold">38</p>
                      <p className="text-xs text-muted-foreground">Pendentes</p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Próximos eventos</span>
                      <Calendar className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="space-y-2">
                      {[
                        { title: 'Reunião de Câmara', time: '14:00' },
                        { title: 'Atendimento cidadão', time: '16:30' },
                      ].map((event, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-white/60 p-2">
                          <span className="text-xs font-medium">{event.title}</span>
                          <span className="text-xs text-muted-foreground">{event.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Recursos completos</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Tudo que seu gabinete precisa
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Ferramentas profissionais para modernizar a gestão pública e estreitar o relacionamento com os cidadãos.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`mb-6 inline-flex rounded-xl ${feature.bg} p-3 shadow-sm`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>

                  {/* Hover effect */}
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2">
              <Zap className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600">Planos flexíveis</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Escolha o plano ideal para você
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Comece gratuitamente e escale conforme suas necessidades. Todos os planos incluem suporte e atualizações.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-3xl border ${
                  plan.highlighted
                    ? 'border-primary/50 bg-gradient-to-b from-primary/5 to-transparent shadow-2xl shadow-primary/20'
                    : 'border-gray-200/80 bg-white'
                } p-8 transition-all hover:-translate-y-2`}
              >
                {plan.badge && (
                  <div className="absolute right-8 top-8">
                    <span className="rounded-full bg-gradient-to-r from-primary to-violet-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`mb-6 inline-flex rounded-xl bg-gradient-to-br ${plan.color} p-3 shadow-lg`}>
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>

                <h3 className="mb-2 text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="mb-6 text-sm text-muted-foreground">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">R$ {plan.price}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                </div>

                <Link href="/cadastro">
                  <Button
                    variant={plan.buttonVariant}
                    className={`mb-8 w-full ${
                      plan.highlighted ? 'shadow-lg shadow-primary/30' : ''
                    }`}
                    size="lg"
                  >
                    Começar agora
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Todos os planos incluem 14 dias de teste grátis. Cancele a qualquer momento.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gradient-to-br from-slate-50 to-blue-50/50 px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2">
              <Star className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-600">Depoimentos</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              O que nossos clientes dizem
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Veja como estamos transformando a gestão municipal em todo o Brasil.
            </p>
          </div>

          <TestimonialsCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-5 py-20 sm:px-6 lg:px-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/30 to-violet-500/30 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-gradient-to-tl from-purple-400/30 to-pink-500/30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-blue-600 via-primary to-violet-600 p-12 shadow-2xl sm:p-16">
            {/* Decorative grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

            {/* Glow effects */}
            <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Comece hoje mesmo</span>
              </div>

              {/* Heading */}
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Pronto para transformar seu gabinete?
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-white/90 sm:text-xl">
                Junte-se a centenas de vereadores que já modernizaram sua gestão com nossa plataforma.
                Teste grátis por 14 dias, sem cartão de crédito.
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/cadastro">
                  <Button
                    size="lg"
                    className="group w-full bg-white text-primary shadow-2xl transition-all hover:scale-105 hover:bg-white hover:shadow-white/25 sm:w-auto"
                  >
                    <Zap className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                    Começar gratuitamente
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/50 sm:w-auto"
                  >
                    Fazer login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-white/20 pt-8">
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Cancele quando quiser</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Suporte em português</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white px-5 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <span className="text-xl font-bold text-white">MP</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-foreground">Meu Político</span>
                <span className="text-xs text-muted-foreground">Gestão Municipal Inteligente</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <a href="#features" className="text-sm text-muted-foreground transition hover:text-foreground">
                Recursos
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground transition hover:text-foreground">
                Planos
              </a>
              <a href="#testimonials" className="text-sm text-muted-foreground transition hover:text-foreground">
                Depoimentos
              </a>
              <Link href="/login" className="text-sm text-muted-foreground transition hover:text-foreground">
                Login
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Meu Político. Todos os direitos reservados. Desenvolvido para fortalecer a
              governança municipal.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
