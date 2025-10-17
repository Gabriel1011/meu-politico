'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUserContext } from '@/hooks/use-user-context'
import { ticketsService } from '@/services/tickets.service'
import { logError } from '@/lib/error-handler'
import { UPLOAD } from '@/lib/constants'
import type { Category } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { GoogleMapsDialog } from '@/components/location/google-maps-dialog'

const normalizeCep = (value: string) => value.replace(/\D/g, '').slice(0, 8)

const formatCep = (value: string) => {
  const digits = normalizeCep(value)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

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

interface TicketFormProps {
  onSuccess?: () => void
}

export function TicketForm({ onSuccess }: TicketFormProps = {}) {
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
    complemento: '',
    cep: '',
    logradouro: '',
    cidade: '',
    estado: '',
  })
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [lastSearchedCep, setLastSearchedCep] = useState('')

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

  const fetchAddressByCep = useCallback(async (cepDigits: string) => {
    if (cepDigits.length !== 8) return

    setIsFetchingCep(true)
    setCepError(null)

    try {
      const response = await fetch(`/api/cep?cep=${cepDigits}`)
      const data = await response.json()

      if (!response.ok) {
        setCepError(
          (data && typeof data.error === 'string'
            ? data.error
            : 'Não foi possível buscar o CEP.') || null
        )
        setLastSearchedCep('')
        return
      }

      setLastSearchedCep(cepDigits)

      setFormData((prev) => ({
        ...prev,
        cep: data?.cep ? formatCep(data.cep) : prev.cep,
        bairro: data?.bairro || prev.bairro,
        logradouro: data?.logradouro || prev.logradouro,
        cidade: data?.cidade || prev.cidade,
        estado: data?.estado || prev.estado,
      }))
    } catch (err) {
      const appError = logError(err, 'TicketForm.fetchAddressByCep')
      setCepError(appError.userMessage || 'Não foi possível buscar o CEP.')
      setLastSearchedCep('')
    } finally {
      setIsFetchingCep(false)
    }
  }, [])

  useEffect(() => {
    const digits = normalizeCep(formData.cep)

    if (digits.length === 8 && digits !== lastSearchedCep && !isFetchingCep) {
      fetchAddressByCep(digits)
    }
  }, [fetchAddressByCep, formData.cep, isFetchingCep, lastSearchedCep])

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
        localizacao: (() => {
          const locationEntries = Object.entries({
            cep: formData.cep || undefined,
            logradouro: formData.logradouro || undefined,
            complemento: formData.complemento || undefined,
            bairro: formData.bairro || undefined,
            cidade: formData.cidade || undefined,
            estado: formData.estado || undefined,
          }).filter(([, value]) => Boolean(value))

          if (locationEntries.length === 0) return undefined

          return Object.fromEntries(locationEntries) as {
            cep?: string
            logradouro?: string
            complemento?: string
            bairro?: string
            cidade?: string
            estado?: string
          }
        })(),
        fotos: uploadedImages,
      })

      if (onSuccess) {
        onSuccess()
        router.refresh()
      } else {
        router.push('/painel/ocorrencias')
        router.refresh()
      }
    } catch (err) {
      const appError = logError(err, 'TicketForm.handleSubmit')
      setError(appError.userMessage)
    } finally {
      setLoading(false)
    }
  }

  const locationForMap = {
    cep: formData.cep,
    logradouro: formData.logradouro,
    complemento: formData.complemento,
    bairro: formData.bairro,
    cidade: formData.cidade,
    estado: formData.estado,
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
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, titulo: e.target.value }))
          }
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
            setFormData((prev) => ({ ...prev, descricao: e.target.value }))
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
            setFormData((prev) => ({
              ...prev,
              categoria_id: e.target.value,
            }))
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
        <Label htmlFor="cep">CEP</Label>
        <Input
          id="cep"
          value={formData.cep}
          onChange={(e) => {
            const formatted = formatCep(e.target.value)
            const digits = normalizeCep(e.target.value)
            setFormData((prev) => ({ ...prev, cep: formatted }))
            if (digits.length < 8 && lastSearchedCep) {
              setLastSearchedCep('')
            }
            if (cepError) setCepError(null)
          }}
          onBlur={() => {
            const digits = normalizeCep(formData.cep)
            if (digits.length === 8 && digits !== lastSearchedCep && !isFetchingCep) {
              void fetchAddressByCep(digits)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              const digits = normalizeCep(formData.cep)
              if (digits.length === 8 && digits !== lastSearchedCep && !isFetchingCep) {
                void fetchAddressByCep(digits)
              }
            }
          }}
          placeholder="Digite o CEP"
          inputMode="numeric"
          className="mt-1"
          disabled={loading || isFetchingCep}
        />
        {cepError ? (
          <p className="mt-1 text-xs text-destructive">{cepError}</p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            {isFetchingCep
              ? 'Buscando endereço...'
              : 'Informe o CEP para preencher automaticamente o endereço.'}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="logradouro">Logradouro</Label>
          <Input
            id="logradouro"
            value={formData.logradouro}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                logradouro: e.target.value,
              }))
            }
            placeholder="Ex: Rua das Flores"
            className="mt-1"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            value={formData.complemento}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                complemento: e.target.value,
              }))
            }
            placeholder="Ex: Apto 101, Bloco B"
            className="mt-1"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            value={formData.bairro}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bairro: e.target.value }))
            }
            placeholder="Ex: Centro"
            className="mt-1"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={formData.cidade}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cidade: e.target.value }))
            }
            placeholder="Ex: São Paulo"
            className="mt-1"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="estado">Estado</Label>
        <Input
          id="estado"
          value={formData.estado}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              estado: e.target.value.toUpperCase(),
            }))
          }
          placeholder="Ex: SP"
          className="mt-1 uppercase"
          maxLength={2}
          disabled={loading}
        />
      </div>

      <GoogleMapsDialog
        location={locationForMap}
        triggerLabel="Visualizar no mapa"
        buttonVariant="outline"
        buttonSize="sm"
        buttonClassName="self-start"
      />

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
