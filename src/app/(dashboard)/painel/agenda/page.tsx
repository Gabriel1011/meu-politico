import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AgendaManagementClient } from './agenda-management-client'

export default async function AgendaPage() {
  const supabase = await createClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile and check role
  const { data: profile } = await supabase
    .from('profile')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.tenant_id) {
    redirect('/painel')
  }

  const isStaff = ['assessor', 'politico', 'admin'].includes(profile.role)
  const isCitizen = profile.role === 'cidadao'

  // Get events based on role
  let query = supabase
    .from('events')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('start_date', { ascending: false })

  // Citizens only see published events
  if (isCitizen) {
    query = query.eq('published', true)
  }

  const { data: events, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agenda</h1>
        <p className="text-muted-foreground">
          {isStaff
            ? 'Gerencie os eventos da sua agenda pública'
            : 'Acompanhe os eventos da agenda'}
        </p>
      </div>

      <AgendaManagementClient
        events={events || []}
        tenantId={profile.tenant_id}
        isStaff={isStaff}
      />
    </div>
  )
}
