import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicAgendaHeader } from '@/components/agenda/public-agenda-header'
import { PublicAgendaClient } from '@/components/agenda/public-agenda-client'
import { ThemeProvider } from '@/components/agenda/theme-provider'
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

  const tenantId = tenant.id
  const tenantCores = tenant.cores
  const tenantLogo = tenant.logo_url
  const tenantNome = tenant.nome_publico

  // Get published events for this tenant
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('published', true)
    .order('start_date', { ascending: false })

  if (eventsError) {
    console.error('Error fetching events:', eventsError)
  }

  // Generate theme variables
  const themeVars = generateThemeVariables(
    tenantCores as { primaria: string; secundaria: string }
  )

  return (
    <ThemeProvider themeVars={themeVars}>
      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <PublicAgendaHeader tenantName={tenantNome} tenantLogo={tenantLogo} />

        {/* Events List */}
        <div className="container mx-auto px-4 py-12">
          <PublicAgendaClient events={events || []} slug={slug} />
        </div>
      </div>
    </ThemeProvider>
  )
}
