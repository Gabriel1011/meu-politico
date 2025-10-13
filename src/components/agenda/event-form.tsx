'use client'

import { useState } from 'react'
import { AgendaEvent } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { ReactDateTimePicker } from '@/components/ui/react-date-time-picker'
import { createClient } from '@/lib/supabase/client'

interface EventFormProps {
  event?: AgendaEvent | null
  tenantId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function EventForm({
  event,
  tenantId,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const isEditing = !!event

  // Form state
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [location, setLocation] = useState(event?.location || '')

  // Date and time state
  const [startDate, setStartDate] = useState<Date | undefined>(
    event ? new Date(event.start_date) : (() => {
      const now = new Date()
      now.setHours(9, 0, 0, 0)
      return now
    })()
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    event ? new Date(event.end_date) : (() => {
      const now = new Date()
      now.setHours(10, 0, 0, 0)
      return now
    })()
  )

  const [bannerUrl, setBannerUrl] = useState<string | null>(event?.banner_url || null)
  const [published, setPublished] = useState(event?.published ?? false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate dates
      if (!startDate || !endDate) {
        setError('Por favor, selecione as datas de início e término')
        setLoading(false)
        return
      }

      if (endDate < startDate) {
        setError('A data/hora de término deve ser posterior à data/hora de início')
        setLoading(false)
        return
      }

      const eventData = {
        tenant_id: tenantId,
        title: title,
        description: description,
        location: location || null,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        banner_url: bannerUrl || null,
        published: published,
      }

      if (isEditing) {
        // Update existing event
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)

        if (updateError) throw updateError
      } else {
        // Create new event
        const { error: insertError } = await supabase
          .from('events')
          .insert(eventData)

        if (insertError) throw insertError
      }

      // Success
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error('Error saving event:', err)
      setError(err.message || 'Erro ao salvar evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="titulo">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="titulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Audiência Pública sobre Mobilidade Urbana"
          required
          maxLength={255}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">
          Descrição <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="descricao"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva os detalhes do evento..."
          required
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Date and Time Selection */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>
            Data e Hora de Início <span className="text-destructive">*</span>
          </Label>
          <ReactDateTimePicker
            selected={startDate}
            onChange={(date) => setStartDate(date || undefined)}
            placeholder="Selecione a data e hora de início"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>
            Data e Hora de Término <span className="text-destructive">*</span>
          </Label>
          <ReactDateTimePicker
            selected={endDate}
            onChange={(date) => setEndDate(date || undefined)}
            placeholder="Selecione a data e hora de término"
            minDate={startDate}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="local">Local</Label>
        <Input
          id="local"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex: Câmara Municipal - Plenário"
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bannerUrl">Banner do Evento</Label>
        <ImageUpload
          value={bannerUrl}
          onChange={setBannerUrl}
          tenantId={tenantId}
          bucket="uploads"
          category="events"
          maxSizeMB={5}
          disabled={loading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="publicado"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="publicado" className="cursor-pointer text-sm">
          Publicar evento (visível publicamente)
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Salvando...'
            : isEditing
              ? 'Atualizar Evento'
              : 'Criar Evento'}
        </Button>
      </div>
    </form>
  )
}
