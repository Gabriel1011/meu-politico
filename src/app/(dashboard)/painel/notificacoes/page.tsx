import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationsView } from '@/components/notifications/notifications-view'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Notificações - Meu Político',
  description: 'Acompanhe todas as notificações do gabinete.',
}

async function NotificationsContent() {
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
    <>
      <NotificationsView userId={userId} tenantId={tenantId} role={userRole} />

      {!tenantId && (
        <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Para visualizar notificações do gabinete, vincule-se a um tenant ativo.
        </div>
      )}
    </>
  )
}

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
        <p className="text-muted-foreground">
          Consulte, filtre e atualize o status das notificações enviadas para você ou para o seu
          gabinete.
        </p>
      </header>

      <Suspense fallback={
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      }>
        <NotificationsContent />
      </Suspense>
    </div>
  )
}
