'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, Loader2, MailOpen } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/error-handler'
import type { Database } from '@/types/database.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Notification = Database['public']['Tables']['notifications']['Row']

const MOBILE_BREAKPOINT = 768

export function NotificationBell() {
  const supabase = useMemo(() => createClient(), [])

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(
    async (options?: { silent?: boolean }) => {
      if (options?.silent) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .is('read_at', null)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        setNotifications(data ?? [])
        setError(null)
      } catch (err) {
        const appError = logError(err, 'NotificationBell.fetchNotifications')
        setError(appError.userMessage)
        setNotifications([])
      } finally {
        if (options?.silent) {
          setIsRefreshing(false)
        } else {
          setIsLoading(false)
        }
      }
    },
    [supabase]
  )

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile((prev) => {
        if (prev !== mobile) {
          setIsOpen(false)
        }
        return mobile
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (open) {
        fetchNotifications({ silent: true })
      }
    },
    [fetchNotifications]
  )

  const unreadCount = useMemo(() => notifications.length, [notifications])

  const markAsRead = useCallback(
    async (id: string) => {
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.add(id)
        return next
      })

      try {
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', id)

        if (updateError) throw updateError

        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      } catch (err) {
        logError(err, 'NotificationBell.markAsRead')
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    },
    [supabase]
  )

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.map((n) => n.id)
    if (unreadIds.length === 0) return

    setMarkingAll(true)

    try {
      const { data, error: updateError } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds)
        .select()

      if (updateError) throw updateError

      if (data) {
        const markedIds = new Set(data.map((notification) => notification.id))
        setNotifications((prev) => prev.filter((notification) => !markedIds.has(notification.id)))
      }
    } catch (err) {
      logError(err, 'NotificationBell.markAllAsRead')
    } finally {
      setMarkingAll(false)
    }
  }, [notifications, supabase])

  const bellButton = (
    <button
      type="button"
      onClick={() => {
        if (isMobile) {
          handleOpenChange(true)
        }
      }}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full border',
        'bg-white transition-colors hover:bg-gray-100 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'touch-manipulation transition-transform active:scale-95'
      )}
      aria-haspopup={isMobile ? 'dialog' : 'menu'}
      aria-expanded={isOpen}
      aria-label={
        unreadCount > 0
          ? `Você tem ${unreadCount} notificações não lidas`
          : 'Todas as notificações foram lidas'
      }
    >
      <Bell
        className={cn(
          'h-5 w-5',
          unreadCount > 0 ? 'text-primary' : 'text-muted-foreground'
        )}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
          {unreadCount}
        </span>
      )}
    </button>
  )

  const notificationsContent = (
    <div className="flex max-h-80 flex-col">
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Carregando notificações...
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button size="sm" variant="outline" onClick={() => fetchNotifications()}>
            Tentar novamente
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
          <MailOpen className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
          <p>Você está em dia! Sem notificações no momento.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {isRefreshing && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Atualizando...
            </div>
          )}
          <ul className="space-y-2 px-2 py-3">
            {notifications.map((notification) => {
              const isPending = pendingIds.has(notification.id) || markingAll

              return (
                <li key={notification.id}>
                  <div className="group rounded-lg border border-primary/30 bg-primary/5 px-3 py-3 transition-colors hover:bg-primary/10">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                        )}
                        <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                          {formatDateTime(notification.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        disabled={isPending}
                        className={cn(
                          'flex items-center gap-2 text-xs font-medium text-primary transition-colors hover:text-primary/80',
                          isPending && 'cursor-not-allowed opacity-70'
                        )}
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <>
                            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            Marcar como lida
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <>
        {bellButton}
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="flex h-[70vh] w-full max-w-md flex-col overflow-hidden p-0">
            <DialogHeader className="border-b px-4 py-3">
              <DialogTitle className="flex items-center justify-between text-base">
                <span>Notificações</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={markingAll}
                    className="gap-2 text-xs"
                  >
                    {markingAll ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Marcar todas como lidas
                  </Button>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">{notificationsContent}</div>
            <div className="border-t bg-muted/40 px-4 py-3">
              <Link
                href="/painel/notificacoes"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                onClick={() => setIsOpen(false)}
              >
                Ver todas as notificações
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{bellButton}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg" sideOffset={12}>
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 text-sm font-semibold">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAll}
              className={cn(
                'flex items-center gap-2 text-xs font-medium text-primary transition-colors hover:text-primary/80',
                markingAll && 'cursor-not-allowed opacity-70'
              )}
            >
              {markingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Marcar todas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-1 pb-2">{notificationsContent}</div>
        <div className="border-t bg-muted/40 px-4 py-3">
          <Link
            href="/painel/notificacoes"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            onClick={() => setIsOpen(false)}
          >
            Ver todas as notificações
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
