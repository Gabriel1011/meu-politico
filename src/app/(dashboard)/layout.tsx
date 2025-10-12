import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'

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

  // Buscar dados do usuário
  const { data: userData } = await supabase
    .from('profile')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader user={userData} />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar userRole={userData?.role || 'cidadao'} />
        <main className="flex-1 overflow-y-auto lg:ml-0 custom-scrollbar">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl pb-safe">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
