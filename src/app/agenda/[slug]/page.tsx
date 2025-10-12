import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EventCalendar } from '@/components/agenda/event-calendar'
import { EventDetailModal } from '@/components/agenda/event-detail-modal'
import { AgendaClient } from './agenda-client'
import { generateThemeVariables } from '@/lib/color-utils'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AgendaPublicaPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Get tenant by slug
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('ativo', true)
    .single()

  if (tenantError || !tenant) {
    notFound()
  }

  // Get published events for this tenant
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('published', true)
    .order('start_date', { ascending: false })

  if (eventsError) {
    console.error('Error fetching events:', eventsError)
  }

  // Generate theme variables
  const themeVars = generateThemeVariables(
    tenant.cores as { primaria: string; secundaria: string }
  )

  return (
    <div className="min-h-screen bg-background" style={themeVars as any}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.nome_publico}
                className="h-20 w-auto"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {tenant.nome_publico.charAt(0)}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold">{tenant.nome_publico}</h1>
          <p className="mt-2 text-muted-foreground">Agenda Pública</p>
        </div>

        {/* Calendar */}
        <AgendaClient events={events || []} />
      </div>
    </div>
  )
}
