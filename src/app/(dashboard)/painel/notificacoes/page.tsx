import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationsView } from '@/components/notifications/notifications-view'

export const metadata = {
  title: 'Notificações - Meu Político',
  description: 'Acompanhe todas as notificações do gabinete.',
}

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('id, nome_completo, role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="rounded-lg border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar seu perfil. Atualize a página e tente novamente.
        </p>
      </div>
    )
  }

  const userId = profile.id
  const tenantId = profile.tenant_id
  const userRole = profile.role

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
        <p className="text-muted-foreground">
          Consulte, filtre e atualize o status das notificações enviadas para você ou para o seu
          gabinete.
        </p>
      </header>

      <NotificationsView userId={userId} tenantId={tenantId} role={userRole} />

      {!tenantId && (
        <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Para visualizar notificações do gabinete, vincule-se a um tenant ativo.
        </div>
      )}
    </div>
  )
}
