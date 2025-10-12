'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function TicketForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    bairro: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('ativa', true)
      .order('ordem')

    if (data) {
      setCategories(data)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `tickets/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('uploads').getPublicUrl(filePath)

        return publicUrl
      })

      const urls = await Promise.all(uploadPromises)
      setUploadedImages([...uploadedImages, ...urls])
    } catch (err) {
      setError('Erro ao fazer upload das imagens')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Buscar dados do usuário
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Usuário não autenticado')
      setLoading(false)
      return
    }

    const { data: userData } = await supabase
      .from('profile')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!userData?.tenant_id) {
      setError('Usuário não vinculado a um gabinete')
      setLoading(false)
      return
    }

    // Gerar número de protocolo
    const { data: ticketNumber } = await supabase.rpc('generate_ticket_number', {
      p_tenant_id: userData.tenant_id,
    })

    // Criar ticket
    const { error: createError } = await supabase.from('tickets').insert({
      tenant_id: userData.tenant_id,
      user_id: user.id,
      ticket_number: ticketNumber,
      titulo: formData.titulo,
      descricao: formData.descricao,
      categoria_id: formData.categoria_id || null,
      localizacao: formData.bairro
        ? { bairro: formData.bairro }
        : null,
      fotos: uploadedImages,
    })

    if (createError) {
      setError(createError.message)
      setLoading(false)
      return
    }

    // Redirecionar para lista de ocorrências
    router.push('/painel/ocorrencias')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          required
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          placeholder="Ex: Buraco na rua principal"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <textarea
          id="descricao"
          required
          value={formData.descricao}
          onChange={(e) =>
            setFormData({ ...formData, descricao: e.target.value })
          }
          placeholder="Descreva o problema em detalhes..."
          className="mt-1 flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div>
        <Label htmlFor="categoria_id">Categoria</Label>
        <select
          id="categoria_id"
          value={formData.categoria_id}
          onChange={(e) =>
            setFormData({ ...formData, categoria_id: e.target.value })
          }
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="bairro">Bairro</Label>
        <Input
          id="bairro"
          value={formData.bairro}
          onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
          placeholder="Ex: Centro"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="fotos">Fotos (opcional)</Label>
        <Input
          id="fotos"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="mt-1"
        />
        {uploadedImages.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="h-24 w-full rounded object-cover"
                />
              </div>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Você pode adicionar fotos para ajudar a descrever o problema
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Ocorrência'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
