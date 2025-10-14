'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCheck, Loader2, Plus, RefreshCcw, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { cn, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Notification = Database['public']['Tables']['notifications']['Row'] & {
  destinatario?: {
    id: string
    nome_completo: string | null
    role: string
  } | null
}

type FilterKey = 'mine' | 'citizens' | 'tenant'
type ReadFilter = 'all' | 'unread' | 'read'
type SortOrder = 'desc' | 'asc'

type Recipient = {
  id: string
  tenant_id: string
  nome: string | null
}

type NotificationsViewProps = {
  userId: string
  tenantId: string | null
  role: string
}

type FilterOption = {
  key: FilterKey
  label: string
  description: string
  disabled?: boolean
}

export function NotificationsView({ userId, tenantId, role }: NotificationsViewProps) {
  const supabase = useMemo(() => createClient(), [])
  const canSendNotifications = useMemo(
    () => ['assessor', 'politico', 'admin', 'superadmin'].includes(role),
    [role]
  )
  const isCitizen = role === 'cidadao'

  const defaultFilter = useMemo<FilterKey>(() => (isCitizen ? 'mine' : 'tenant'), [isCitizen])

  const filters = useMemo<FilterOption[]>(() => {
    if (!isCitizen) {
      return []
    }

    return [
      {
        key: 'mine',
        label: 'Minhas notificações',
        description: 'Itens enviados diretamente para você.',
      },
      {
        key: 'citizens',
        label: 'Todos os cidadãos',
        description: 'Notificações enviadas para cidadãos do gabinete.',
        disabled: !tenantId,
      },
    ]
  }, [isCitizen, tenantId])

  const [selectedFilter, setSelectedFilter] = useState<FilterKey>(defaultFilter)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    setSelectedFilter(defaultFilter)
  }, [defaultFilter])

useEffect(() => {
  if (!isCitizen) {
    return
  }

  if (!filters.find((item) => item.key === selectedFilter) && filters.length > 0) {
    setSelectedFilter(filters[0].key)
  }
}, [filters, isCitizen, selectedFilter])

  const fetchNotifications = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!tenantId && (isCitizen ? selectedFilter !== 'mine' : true)) {
        setNotifications([])
        setError('Você ainda não está vinculado a um gabinete.')
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      if (options?.silent) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      let query = supabase
        .from('notifications')
        .select(
          `
            id,
            title,
            message,
            type,
            metadata,
            created_at,
            read_at,
            recipient_id,
            tenant_id,
            destinatario:profile (
              id,
              nome_completo,
              role
            )
          `
        )
        .order('created_at', { ascending: sortOrder === 'asc' })

      if (isCitizen) {
        if (selectedFilter === 'mine') {
          query = query.eq('recipient_id', userId)
        } else if (selectedFilter === 'citizens') {
          query = query.eq('tenant_id', tenantId!).eq('destinatario.role', 'cidadao')
        }
      } else {
        query = query.eq('tenant_id', tenantId!)
      }

      if (readFilter === 'unread') {
        query = query.is('read_at', null)
      } else if (readFilter === 'read') {
        query = query.not('read_at', 'is', null)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar notificações', error)
        setError('Não foi possível carregar as notificações.')
        setNotifications([])
      } else {
        const notificationsData = (data || []).map(item => ({
          ...item,
          destinatario: Array.isArray(item.destinatario) ? item.destinatario[0] : item.destinatario
        }))
        setNotifications(notificationsData as Notification[])
        setError(null)
      }

      if (options?.silent) {
        setIsRefreshing(false)
      } else {
        setIsLoading(false)
      }
    },
    [isCitizen, selectedFilter, readFilter, sortOrder, supabase, tenantId, userId]
  )

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    const loadRecipients = async () => {
      if (!isCreateOpen || !tenantId || !canSendNotifications) {
        return
      }

      const citizensResult = await fetchTenantCitizens(supabase, tenantId)

      if (citizensResult.error) {
        console.error('Erro ao carregar destinatários', citizensResult.error)
        return
      }

      const citizens = citizensResult.data

      setRecipients(
        citizens.map((item) => ({
          id: item.id,
          tenant_id: item.tenant_id,
          nome: item.nome_completo,
        }))
      )
    }

    loadRecipients()
  }, [canSendNotifications, isCreateOpen, supabase, tenantId])

  useEffect(() => {
    if (!isCreateOpen) {
      setTitulo('')
      setMensagem('')
      setIsSubmitting(false)
    }
  }, [isCreateOpen])

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timeout = setTimeout(() => {
      setSuccessMessage(null)
    }, 6000)

    return () => clearTimeout(timeout)
  }, [successMessage])

  const toggleReadState = async (notification: Notification) => {
    if (notification.recipient_id !== userId) {
      return
    }

    setUpdatingIds((prev) => {
      const next = new Set(prev)
      next.add(notification.id)
      return next
    })

    const nextReadValue = notification.read_at ? null : new Date().toISOString()

    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: nextReadValue })
      .eq('id', notification.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar notificação', error)
    } else if (data) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === notification.id ? { ...item, ...data } : item))
      )
    }

    setUpdatingIds((prev) => {
      const next = new Set(prev)
      next.delete(notification.id)
      return next
    })
  }

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read_at).length,
    [notifications]
  )

  const handleFilterChange = (key: FilterKey) => {
    setSelectedFilter(key)
  }

  const handleCreateNotification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!tenantId || !titulo.trim() || !mensagem.trim()) {
      return
    }

    if (!tenantId) {
      setSuccessMessage('Não foi possível identificar o gabinete para enviar a notificação.')
      setIsCreateOpen(false)
      setIsSubmitting(false)
      return
    }

    const citizensResult = await fetchTenantCitizens(supabase, tenantId)

    if (citizensResult.error) {
      console.error('Erro ao localizar cidadãos para notificação', citizensResult.error)
      setIsSubmitting(false)
      return
    }

    const citizens = citizensResult.data

    const destinatarios = citizens.filter((recipient) => recipient.id !== userId)

    if (destinatarios.length === 0) {
      setSuccessMessage('Notificação registrada, mas não há cidadãos para receber no momento.')
      setIsCreateOpen(false)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(true)

    const payload = destinatarios.map((recipient) => ({
      tenant_id: recipient.tenant_id,
      recipient_id: recipient.id,
      title: titulo.trim(),
      message: mensagem.trim(),
      type: 'manual',
    }))

    const { error } = await supabase.from('notifications').insert(payload)

    if (error) {
      console.error('Erro ao criar notificações', error)
    } else {
      await fetchNotifications({ silent: true })
      setSuccessMessage(
        `Notificação enviada para ${destinatarios.length} cidadão${destinatarios.length === 1 ? '' : 's'}.`
      )
      setIsCreateOpen(false)
      setTitulo('')
      setMensagem('')
    }

    setIsSubmitting(false)
  }

  const activeFilter = filters.find((filter) => filter.key === selectedFilter)
  const headerDescription = !isCitizen
    ? 'Visualizando todas as notificações do gabinete.'
    : activeFilter?.description ?? 'Consulte o histórico de notificações.'
  const showEmptyState = !isLoading && notifications.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{headerDescription}</p>
          {selectedFilter !== 'mine' && (
            <p className="text-xs text-muted-foreground">
              As permissões seguem as regras do seu perfil ({role}).
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canSendNotifications && (
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova notificação
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => fetchNotifications({ silent: true })}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
          {selectedFilter === 'mine' && unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {unreadCount} não lidas
            </span>
          )}
        </div>
      </div>

      {successMessage && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </CardContent>
        </Card>
      )}

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              type="button"
              variant={selectedFilter === filter.key ? 'default' : 'outline'}
              disabled={filter.disabled}
              onClick={() => handleFilterChange(filter.key)}
              className={cn(
                'gap-2',
                filter.disabled && 'cursor-not-allowed opacity-60',
                selectedFilter === filter.key && 'shadow-sm'
              )}
            >
              {filter.key === 'citizens' ? (
                <Users className="h-4 w-4" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              {filter.label}
            </Button>
          ))}
        </div>
      )}

      <Card className="border-dashed">
        <CardContent className="flex flex-wrap gap-4 p-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </Label>
            <Select value={readFilter} onValueChange={(value) => setReadFilter(value as ReadFilter)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ordenar
            </Label>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Mais recentes</SelectItem>
                <SelectItem value="asc">Mais antigas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center p-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando notificações...
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      ) : showEmptyState ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            <p className="font-medium">Nenhuma notificação encontrada.</p>
            <p className="mt-2 text-xs">
              As notificações aparecerão aqui assim que forem enviadas para este grupo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {isRefreshing && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sincronizando...
            </div>
          )}
          <div className="space-y-3">
            {notifications.map((notification) => {
              const isOwn = notification.recipient_id === userId
              const isUnread = !notification.read_at
              const isUpdating = updatingIds.has(notification.id)

              return (
                <Card
                  key={notification.id}
                  className={cn(
                    'transition-shadow hover:shadow-sm',
                    isUnread ? 'border-primary/40 bg-primary/5' : 'bg-white'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-semibold uppercase">
                            {notification.type}
                          </Badge>
                          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {formatDateTime(notification.created_at)}
                          </span>
                          {isUnread && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px]">
                              Não lida
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        )}
                        {notification.destinatario && (
                          <p className="text-xs text-muted-foreground">
                            Destinatário:{' '}
                            <span className="font-medium">
                              {notification.destinatario.nome_completo || 'Usuário sem nome'}
                            </span>{' '}
                            <span className="text-muted-foreground/80">
                              ({notification.destinatario.role})
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-start gap-2 md:items-end">
                        {isOwn ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleReadState(notification)}
                            disabled={isUpdating}
                            className="gap-2"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCheck className="h-4 w-4" />
                            )}
                            {isUnread ? 'Marcar como lida' : 'Marcar como não lida'}
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="text-[11px]">
                            Visualização somente leitura
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      {canSendNotifications && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova notificação</DialogTitle>
              <DialogDescription>
                Envie atualizações rápidas para pessoas do gabinete. Você pode optar por um
                destinatário específico ou todos os cidadãos do tenant.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleCreateNotification}>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wide">
                  Destinatários
                </Label>
                <Card className="border-dashed bg-muted/30">
                  <CardContent className="px-3 py-2 text-sm text-muted-foreground">
                    Todos os cidadãos do gabinete ({recipients.length})
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="titulo">
                  Título
                </Label>
                <Input
                  id="titulo"
                  type="text"
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  required
                  maxLength={120}
                  placeholder="Ex: Reunião com a comunidade"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="mensagem">
                  Mensagem
                </Label>
                <Textarea
                  id="mensagem"
                  value={mensagem}
                  onChange={(event) => setMensagem(event.target.value)}
                  required
                  rows={5}
                  maxLength={600}
                  placeholder="Compartilhe os detalhes da atualização."
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    'Enviar notificação'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

type CitizenRow = { id: string; tenant_id: string; nome_completo: string | null }

async function fetchTenantCitizens(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<{ data: CitizenRow[]; error: PostgrestError | null }>
{
  // Tenta usar a função RPC se existir, senão usa query direta
  try {
    // @ts-expect-error - RPC function may not be in generated types yet
    const rpcResult = await client.rpc('get_tenant_citizens', { p_tenant: tenantId })

    if (!rpcResult.error) {
      const citizens = (rpcResult.data ?? []) as CitizenRow[]
      return { data: citizens, error: null }
    }

    if (rpcResult.error.code && rpcResult.error.code !== 'PGRST202') {
      // Se não for erro de função não encontrada, retorna o erro
      return { data: [], error: rpcResult.error }
    }
  } catch {
    // Ignora erro e usa fallback
  }

  // Fallback: usa query direta
  const selectResult = await client
    .from('profile')
    .select('id, tenant_id, nome_completo')
    .eq('tenant_id', tenantId)
    .eq('role', 'cidadao')

  if (selectResult.error) {
    return { data: [], error: selectResult.error }
  }

  const citizens = (selectResult.data ?? []) as CitizenRow[]

  return { data: citizens, error: null }
}
