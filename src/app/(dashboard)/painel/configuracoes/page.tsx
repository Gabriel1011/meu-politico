import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsTabs } from '@/components/settings/settings-tabs'

export const metadata = {
  title: 'Configurações - Meu Político',
  description: 'Configure seu gabinete',
}

export default async function ConfiguracoesPage() {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Configure as preferências do gabinete
          </p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Erro ao carregar dados do gabinete.
          </p>
        </div>
      </div>
    )
  }

  // Buscar categorias
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('ordem', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Configure as preferências do gabinete
        </p>
      </div>

      <SettingsTabs tenant={tenant} categories={categories || []} />
    </div>
  )
}
