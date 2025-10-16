import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { DashboardLayoutClient } from '@/components/layout/dashboard-layout-client'
import { ThemeProvider } from '@/components/providers/theme-provider'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar apenas dados essenciais (otimizado - removido JOIN desnecessário)
  const { data: userData } = await supabase
    .from('profile')
    .select('id, nome_completo, email, avatar_url, role, tenant_id')
    .eq('id', user.id)
    .single()

  // Buscar cores do tenant separadamente apenas se necessário
  let tenantColors: { primaria: string; secundaria: string } | null = null

  if (userData?.tenant_id) {
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('cores')
      .eq('id', userData.tenant_id)
      .single()

    tenantColors = tenantData?.cores as { primaria: string; secundaria: string } | null
  }

  return (
    <ThemeProvider cores={tenantColors}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader user={userData} />
        <DashboardLayoutClient userRole={userData?.role || 'cidadao'}>
          {children}
        </DashboardLayoutClient>
      </div>
    </ThemeProvider>
  )
}
