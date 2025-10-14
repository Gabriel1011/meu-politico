import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentTickets } from '@/components/dashboard/recent-tickets'

export const metadata = {
  title: 'Painel - Meu Político',
  description: 'Painel de controle',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Buscar dados do usuário
  const { data: userData } = await supabase
    .from('profile')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single()

  const tenantId = userData?.tenant_id
  const userRole = userData?.role
  const userName = userData?.nome_completo

  return (
    <div className="space-y-8">
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

      {tenantId && userRole && (
        <>
          <DashboardStats tenantId={tenantId} role={userRole} />
          <RecentTickets
            tenantId={tenantId}
            userId={user.id}
            role={userRole}
          />
        </>
      )}

      {!tenantId && userRole === 'cidadao' && (
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Você ainda não está vinculado a nenhum gabinete. Entre em contato
            com seu político para obter acesso.
          </p>
        </div>
      )}
    </div>
  )
}
