import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentTickets } from '@/components/dashboard/recent-tickets'
import { DashboardStatsSkeleton, RecentTicketsSkeleton } from '@/components/ui/skeletons'

export const metadata = {
  title: 'Painel - Meu Político',
  description: 'Painel de controle',
}

async function UserGreeting() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userData } = await supabase
    .from('profile')
    .select('nome_completo, role')
    .eq('id', user.id)
    .single()

  const userName = userData?.nome_completo
  const userRole = userData?.role

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Bem-vindo, {userName || 'Usuário'}
      </h1>
      <p className="text-muted-foreground">
        {userRole === 'cidadao'
          ? 'Acompanhe suas solicitações'
          : 'Gerencie as ocorrências do gabinete'}
      </p>
    </div>
  )
}

async function DashboardContent() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userData } = await supabase
    .from('profile')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  const tenantId = userData?.tenant_id
  const userRole = userData?.role

  if (!tenantId && userRole === 'cidadao') {
    return (
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          Você ainda não está vinculado a nenhum gabinete. Entre em contato
          com seu político para obter acesso.
        </p>
      </div>
    )
  }

  if (!tenantId || !userRole) {
    return null
  }

  return (
    <>
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats tenantId={tenantId} role={userRole} />
      </Suspense>

      <Suspense fallback={<RecentTicketsSkeleton />}>
        <RecentTickets
          tenantId={tenantId}
          userId={user.id}
          role={userRole}
        />
      </Suspense>
    </>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={
        <div>
          <div className="h-9 w-64 bg-muted animate-pulse rounded" />
          <div className="h-5 w-48 bg-muted animate-pulse rounded mt-2" />
        </div>
      }>
        <UserGreeting />
      </Suspense>

      <DashboardContent />
    </div>
  )
}
