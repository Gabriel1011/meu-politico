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

  // Buscar dados do usuário com tenant
  const { data: userData } = await supabase
    .from('profile')
    .select('*, tenants(id, slug, nome_publico, cores, logo_url)')
    .eq('id', user.id)
    .single()

  // Extrair cores do tenant
  const tenantColors = userData?.tenants?.cores as { primaria: string; secundaria: string } | null

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
