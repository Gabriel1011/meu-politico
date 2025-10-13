'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUserContext } from '@/hooks/use-user-context'
import { ticketsService } from '@/services/tickets.service'
import { logError } from '@/lib/error-handler'
import { STORAGE_PATHS, UPLOAD } from '@/lib/constants'
import type { Category } from '@/types'
import { createClient } from '@/lib/supabase/client'

function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-muted rounded" />
      <div className="h-32 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
    </div>
  )
}

export function TicketForm() {
  const router = useRouter()
  const { user, tenantId, loading: authLoading } = useUserContext()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    bairro: '',
  })

  useEffect(() => {
    if (tenantId) loadCategories()
  }, [tenantId])

  const loadCategories = async () => {
    if (!tenantId) return

    try {
      const supabase = createClient()
      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('ativa', true)
        .order('ordem')

      if (categoriesError) throw categoriesError

      if (data) {
        setCategories(data as Category[])
      }
    } catch (err) {
      const appError = logError(err, 'TicketForm.loadCategories')
      setError(appError.userMessage)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (!user || !tenantId) {
      setError('Você precisa estar autenticado para fazer upload')
      return
    }

    // Validar quantidade de arquivos
    if (files.length > UPLOAD.MAX_IMAGES_PER_TICKET) {
      setError(`Máximo de ${UPLOAD.MAX_IMAGES_PER_TICKET} imagens por vez`)
      return
    }

    // Validar tamanho total
    const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0)
    if (totalSize > UPLOAD.MAX_IMAGE_SIZE_BYTES * files.length) {
      setError(`Cada imagem deve ter no máximo ${UPLOAD.MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const urls = await ticketsService.uploadImages(Array.from(files), tenantId, user.id)
      setUploadedImages([...uploadedImages, ...urls])
    } catch (err) {
      const appError = logError(err, 'TicketForm.handleImageUpload')
      setError(appError.userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !tenantId) {
      setError('Você precisa estar autenticado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await ticketsService.createTicket(tenantId, user.id, {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria_id: formData.categoria_id || undefined,
        localizacao: formData.bairro ? { bairro: formData.bairro } : undefined,
        fotos: uploadedImages,
      })

      router.push('/painel/ocorrencias')
      router.refresh()
    } catch (err) {
      const appError = logError(err, 'TicketForm.handleSubmit')
      setError(appError.userMessage)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <FormSkeleton />

  if (!user) {
    return (
      <div className="rounded-md bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Você precisa estar autenticado para criar uma ocorrência
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
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
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          required
          value={formData.descricao}
          onChange={(e) =>
            setFormData({ ...formData, descricao: e.target.value })
          }
          placeholder="Descreva o problema em detalhes..."
          className="mt-1"
          rows={5}
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
        />
        {uploadedImages.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Foto ${index + 1} da ocorrência`}
                  className="h-24 w-full rounded object-cover"
                />
              </div>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Você pode adicionar até {UPLOAD.MAX_IMAGES_PER_TICKET} fotos para
          ajudar a descrever o problema
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
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
