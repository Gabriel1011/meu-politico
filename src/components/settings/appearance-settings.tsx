'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Palette, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Tenant = Database['public']['Tables']['tenants']['Row']

interface AppearanceSettingsProps {
  tenant: Tenant
}

export function AppearanceSettings({ tenant }: AppearanceSettingsProps) {
  const router = useRouter()
  const supabase = createClient()

  const cores = tenant.cores as { primaria?: string; secundaria?: string } | null

  const [primaryColor, setPrimaryColor] = useState(cores?.primaria || '#0D47A1')
  const [secondaryColor, setSecondaryColor] = useState(cores?.secundaria || '#1976D2')
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem')
      return
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB')
      return
    }

    setIsUploading(true)

    try {
      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${tenant.id}-logo-${Date.now()}.${fileExt}`
      const filePath = `${tenant.id}/logos/${fileName}`

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) throw error

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('uploads').getPublicUrl(filePath)

      setLogoUrl(publicUrl)
      toast.success('Logo enviado com sucesso')
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao enviar logo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          cores: {
            primaria: primaryColor,
            secundaria: secondaryColor,
          },
          logo_url: logoUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tenant.id)

      if (error) throw error

      toast.success('Configurações salvas com sucesso')
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Logo do Gabinete
          </CardTitle>
          <CardDescription>
            Faça upload do logo que aparecerá no cabeçalho e em outros locais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logoUrl && (
            <div className="flex justify-center">
              <div className="relative h-32 w-32 rounded-lg border bg-gray-50 p-4">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="logo-upload">
              {logoUrl ? 'Alterar logo' : 'Selecionar logo'}
            </Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: PNG ou SVG com fundo transparente, máximo 2MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Cores do Tema
          </CardTitle>
          <CardDescription>
            Personalize as cores principais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Cor Primária */}
            <div className="space-y-2">
              <Label htmlFor="primary-color">Cor Primária</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="primary-color"
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#0D47A1"
                    className="pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                </div>
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-14 cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usada em botões principais e destaques
              </p>
            </div>

            {/* Cor Secundária */}
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Cor Secundária</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="secondary-color"
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#1976D2"
                    className="pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: secondaryColor }}
                    />
                  </div>
                </div>
                <Input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-14 cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usada em elementos de suporte
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="mb-3 text-sm font-medium">Pré-visualização</p>
            <div className="flex flex-wrap gap-2">
              <Button
                style={{
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }}
                className="pointer-events-none"
              >
                Botão Primário
              </Button>
              <Button
                variant="outline"
                style={{
                  borderColor: secondaryColor,
                  color: secondaryColor,
                }}
                className="pointer-events-none"
              >
                Botão Secundário
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || isUploading}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
