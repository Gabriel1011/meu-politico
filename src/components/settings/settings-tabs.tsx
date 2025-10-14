'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, Info, Tags } from 'lucide-react'
import { AppearanceSettings } from './appearance-settings'
import { PublicInfoSettings } from './public-info-settings'
import { CategoriesSettings } from './categories-settings'
import type { Database } from '@/types/database.types'

type Tenant = Database['public']['Tables']['tenants']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface SettingsTabsProps {
  tenant: Tenant
  categories: Category[]
}

export function SettingsTabs({ tenant, categories }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="appearance" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
        <TabsTrigger value="appearance" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Aparência</span>
        </TabsTrigger>
        <TabsTrigger value="info" className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Informações</span>
        </TabsTrigger>
        <TabsTrigger value="categories" className="flex items-center gap-2">
          <Tags className="h-4 w-4" />
          <span className="hidden sm:inline">Categorias</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="appearance" className="space-y-4">
        <AppearanceSettings tenant={tenant} />
      </TabsContent>

      <TabsContent value="info" className="space-y-4">
        <PublicInfoSettings tenant={tenant} />
      </TabsContent>

      <TabsContent value="categories" className="space-y-4">
        <CategoriesSettings tenantId={tenant.id} categories={categories} />
      </TabsContent>
    </Tabs>
  )
}
