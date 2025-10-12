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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo, {userData?.nome_completo || 'Usuário'}
        </h1>
        <p className="text-muted-foreground">
          {userData?.role === 'cidadao'
            ? 'Acompanhe suas solicitações'
            : 'Gerencie as ocorrências do gabinete'}
        </p>
      </div>

      {userData?.tenant_id && (
        <>
          <DashboardStats tenantId={userData.tenant_id} role={userData.role} />
          <RecentTickets
            tenantId={userData.tenant_id}
            userId={user.id}
            role={userData.role}
          />
        </>
      )}

      {!userData?.tenant_id && userData?.role === 'cidadao' && (
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
