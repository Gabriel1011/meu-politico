'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2, Building, Phone, Mail, MapPin, Facebook, Instagram, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Tenant = Database['public']['Tables']['tenants']['Row']

interface PublicInfoSettingsProps {
  tenant: Tenant
}

interface ContactInfo {
  telefone?: string
  email?: string
  endereco?: string
  horario_atendimento?: string
  whatsapp?: string
  facebook?: string
  instagram?: string
  site?: string
}

export function PublicInfoSettings({ tenant }: PublicInfoSettingsProps) {
  const router = useRouter()
  const supabase = createClient()

  const contato = (tenant.contato as ContactInfo) || {}

  const [nomePublico, setNomePublico] = useState(tenant.nome_publico || '')
  const [telefone, setTelefone] = useState(contato.telefone || '')
  const [email, setEmail] = useState(contato.email || '')
  const [endereco, setEndereco] = useState(contato.endereco || '')
  const [horarioAtendimento, setHorarioAtendimento] = useState(contato.horario_atendimento || '')
  const [whatsapp, setWhatsapp] = useState(contato.whatsapp || '')
  const [facebook, setFacebook] = useState(contato.facebook || '')
  const [instagram, setInstagram] = useState(contato.instagram || '')
  const [site, setSite] = useState(contato.site || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    // Validações básicas
    if (!nomePublico.trim()) {
      toast.error('O nome público é obrigatório')
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          nome_publico: nomePublico.trim(),
          contato: {
            telefone: telefone.trim() || undefined,
            email: email.trim() || undefined,
            endereco: endereco.trim() || undefined,
            horario_atendimento: horarioAtendimento.trim() || undefined,
            whatsapp: whatsapp.trim() || undefined,
            facebook: facebook.trim() || undefined,
            instagram: instagram.trim() || undefined,
            site: site.trim() || undefined,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', tenant.id)

      if (error) throw error

      toast.success('Informações salvas com sucesso')
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar informações')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
          <CardDescription>
            Informações públicas que serão exibidas aos cidadãos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome-publico">
              Nome Público <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nome-publico"
              value={nomePublico}
              onChange={(e) => setNomePublico(e.target.value)}
              placeholder="Ex: Gabinete do Vereador João Silva"
              required
            />
            <p className="text-xs text-muted-foreground">
              Nome que será exibido no topo do sistema
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Informações de Contato
          </CardTitle>
          <CardDescription>
            Dados de contato disponíveis aos cidadãos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@gabinete.com.br"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </Label>
            <Textarea
              id="endereco"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF, CEP"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario">Horário de Atendimento</Label>
            <Textarea
              id="horario"
              value={horarioAtendimento}
              onChange={(e) => setHorarioAtendimento(e.target.value)}
              placeholder="Segunda a Sexta: 8h às 17h"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Redes Sociais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Redes Sociais
          </CardTitle>
          <CardDescription>
            Links para redes sociais e site oficial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Site
            </Label>
            <Input
              id="site"
              type="url"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="https://www.exemplo.com.br"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </Label>
              <Input
                id="facebook"
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
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
