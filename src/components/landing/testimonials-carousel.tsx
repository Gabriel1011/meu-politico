'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Testimonial {
  id: number
  name: string
  role: string
  city: string
  state: string
  avatar: string
  rating: number
  text: string
  highlight: string
  color: string
  bgColor: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Carlos Eduardo Silva',
    role: 'Vereador',
    city: 'São Paulo',
    state: 'SP',
    avatar: 'CES',
    rating: 5,
    text: 'A plataforma revolucionou a forma como gerenciamos as demandas dos cidadãos. O sistema de tickets é intuitivo e nos permite acompanhar cada solicitação do início ao fim. Nossa equipe economiza pelo menos 10 horas por semana em processos administrativos.',
    highlight: 'Economizamos 10h/semana',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 2,
    name: 'Maria Fernanda Costa',
    role: 'Vereadora',
    city: 'Belo Horizonte',
    state: 'MG',
    avatar: 'MFC',
    rating: 5,
    text: 'Excelente ferramenta para organizar a agenda e manter contato direto com a população. O dashboard analítico nos ajuda a tomar decisões baseadas em dados reais. A satisfação dos cidadãos com nosso atendimento aumentou significativamente.',
    highlight: 'Aumento na satisfação',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
  },
  {
    id: 3,
    name: 'Roberto Almeida',
    role: 'Vereador',
    city: 'Curitiba',
    state: 'PR',
    avatar: 'RA',
    rating: 5,
    text: 'Implementamos o Meu Político há 6 meses e os resultados são impressionantes. A transparência melhorou muito e conseguimos demonstrar claramente nosso trabalho para os eleitores. O suporte técnico é excepcional, sempre prontos para ajudar.',
    highlight: 'Transparência e resultados',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 4,
    name: 'Ana Paula Santos',
    role: 'Assessora Parlamentar',
    city: 'Porto Alegre',
    state: 'RS',
    avatar: 'APS',
    rating: 5,
    text: 'Como assessora, preciso de ferramentas eficientes para gerenciar múltiplas demandas simultaneamente. O Meu Político tornou nosso trabalho muito mais organizado. A integração com a agenda e as notificações automáticas são recursos essenciais no dia a dia.',
    highlight: 'Organização e eficiência',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-500/10',
  },
  {
    id: 5,
    name: 'João Pedro Oliveira',
    role: 'Vereador',
    city: 'Florianópolis',
    state: 'SC',
    avatar: 'JPO',
    rating: 5,
    text: 'A melhor decisão que tomamos foi migrar para esta plataforma. O retorno sobre o investimento foi praticamente imediato. Conseguimos atender mais cidadãos com a mesma equipe, e todos os dados ficam centralizados e seguros.',
    highlight: 'ROI imediato',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 6,
    name: 'Fernanda Lima',
    role: 'Vereadora',
    city: 'Recife',
    state: 'PE',
    avatar: 'FL',
    rating: 5,
    text: 'O Meu Político facilitou muito a comunicação com meus eleitores. O sistema de categorização de ocorrências nos ajuda a identificar rapidamente as prioridades. A área do cidadão é moderna e fácil de usar, o que aumentou muito o engajamento.',
    highlight: 'Mais engajamento',
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-500/10',
  },
]

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="relative">
      {/* Main testimonial card */}
      <div className="relative mx-auto max-w-5xl">
        {/* Background glow effect */}
        <div className={`absolute -inset-6 rounded-3xl bg-gradient-to-r ${currentTestimonial.color} opacity-20 blur-3xl transition-all duration-1000`} />

        <div className="relative overflow-hidden rounded-3xl border-2 border-gray-200/80 bg-white p-10 shadow-2xl backdrop-blur-xl sm:p-16">
          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 blur-3xl" />
          <div className={`absolute -left-8 -bottom-8 h-64 w-64 rounded-full ${currentTestimonial.bgColor} blur-3xl`} />

          {/* Quote icon */}
          <div className={`absolute right-12 top-12 rounded-2xl ${currentTestimonial.bgColor} p-4`}>
            <Quote className="h-16 w-16 text-foreground/20" />
          </div>

          {/* Content */}
          <div className="relative space-y-8">
            {/* Rating with animation */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 fill-amber-400 text-amber-400 transition-all hover:scale-110"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
              <div className={`rounded-full ${currentTestimonial.bgColor} px-4 py-1.5`}>
                <span className="text-sm font-bold">5.0</span>
              </div>
            </div>

            {/* Testimonial text */}
            <blockquote className="text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
              "{currentTestimonial.text}"
            </blockquote>

            {/* Highlight badge with icon */}
            <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${currentTestimonial.color} px-5 py-2.5 shadow-lg`}>
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{currentTestimonial.highlight}</span>
            </div>

            {/* Author info with enhanced design */}
            <div className="flex items-center gap-5 border-t pt-8">
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${currentTestimonial.color} text-2xl font-bold text-white shadow-2xl shadow-primary/30`}>
                {currentTestimonial.avatar}
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{currentTestimonial.name}</p>
                <p className="text-base text-muted-foreground">
                  {currentTestimonial.role}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {currentTestimonial.city}/{currentTestimonial.state}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation buttons with gradient */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 sm:-left-6">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className={`h-14 w-14 rounded-full border-2 bg-white shadow-2xl transition-all hover:scale-110 hover:shadow-primary/30`}
          >
            <ChevronLeft className="h-7 w-7" />
          </Button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:-right-6">
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className={`h-14 w-14 rounded-full border-2 bg-white shadow-2xl transition-all hover:scale-110 hover:shadow-primary/30`}
          >
            <ChevronRight className="h-7 w-7" />
          </Button>
        </div>
      </div>

      {/* Enhanced dots indicator */}
      <div className="mt-12 flex justify-center gap-3">
        {testimonials.map((testimonial, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`group relative h-3 rounded-full transition-all ${
              index === currentIndex ? 'w-12' : 'w-3 hover:w-6'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          >
            <div
              className={`absolute inset-0 rounded-full transition-all ${
                index === currentIndex
                  ? `bg-gradient-to-r ${testimonial.color} shadow-lg`
                  : 'bg-gray-300 group-hover:bg-gray-400'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Grid of all testimonials for quick access */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <button
            key={testimonial.id}
            onClick={() => goToSlide(index)}
            className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${
              index === currentIndex
                ? 'border-primary bg-gradient-to-br from-primary/5 to-transparent shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* Glow effect on active */}
            {index === currentIndex && (
              <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${testimonial.color} opacity-20 blur-xl`} />
            )}

            <div className="relative flex items-start gap-4">
              <div
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-lg transition-transform group-hover:scale-110 ${
                  index === currentIndex
                    ? `bg-gradient-to-br ${testimonial.color}`
                    : 'bg-gray-400'
                }`}
              >
                {testimonial.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-base font-bold ${index === currentIndex ? 'text-primary' : 'text-foreground'}`}>
                  {testimonial.name}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {testimonial.city}/{testimonial.state}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
