import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsTabs } from '@/components/settings/settings-tabs'
import { CategoriesSkeleton } from '@/components/ui/skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Configurações - Meu Político',
  description: 'Configure seu gabinete',
}

async function SettingsContent() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar dados do usuário e tenant
  const { data: userData } = await supabase
    .from('profile')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single()

  // Verificar se é político ou admin
  if (!userData || !['politico', 'admin'].includes(userData.role)) {
    redirect('/painel')
  }

  const tenant = userData.tenants

  if (!tenant) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          Erro ao carregar dados do gabinete.
        </p>
      </div>
    )
  }

  // Buscar categorias
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('ordem', { ascending: true })

  return <SettingsTabs tenant={tenant} categories={categories || []} />
}

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Configure as preferências do gabinete
        </p>
      </div>

      <Suspense fallback={
        <div className="space-y-6">
          <div className="flex gap-2 border-b">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <CategoriesSkeleton />
        </div>
      }>
        <SettingsContent />
      </Suspense>
    </div>
  )
}
