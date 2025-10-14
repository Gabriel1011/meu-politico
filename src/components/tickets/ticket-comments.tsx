'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUserContext } from '@/hooks/use-user-context'
import { logError } from '@/lib/error-handler'
import type { TicketCommentWithAuthor, UserRole } from '@/types'

interface CommentCardProps {
  comment: TicketCommentWithAuthor
  isBackoffice: boolean
  isPrivate: boolean
}

function CommentCard({ comment, isBackoffice, isPrivate }: CommentCardProps) {
  return (
    <div className="group">
      {/* Card wrapper */}
      <div className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {comment.profile?.nome_completo?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* Header with name and time */}
            <div className="flex items-baseline gap-2 flex-wrap mb-1">
              <span className="font-semibold text-sm text-foreground">
                {comment.profile?.nome_completo || 'Usuário'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(comment.created_at)}
              </span>
            </div>

            {/* Badges Row */}
            {(isBackoffice || isPrivate) && (
              <div className="flex items-center gap-1.5 mb-2">
                {isBackoffice && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Equipe
                  </span>
                )}
                {isPrivate && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Interno
                  </span>
                )}
              </div>
            )}

            {/* Comment Message */}
            <div className="relative">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {comment.mensagem}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TicketCommentsProps {
  ticketId: string
  userRole: UserRole
}

export function TicketComments({ ticketId, userRole }: TicketCommentsProps) {
  const { user } = useUserContext()
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const commentsListRef = useRef<HTMLDivElement>(null)

  const [comments, setComments] = useState<TicketCommentWithAuthor[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [showOlderComments, setShowOlderComments] = useState(false)

  const VISIBLE_COMMENTS_COUNT = 4

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Split comments into older and recent
  const olderComments = comments.length > VISIBLE_COMMENTS_COUNT
    ? comments.slice(0, comments.length - VISIBLE_COMMENTS_COUNT)
    : []
  const recentComments = comments.length > VISIBLE_COMMENTS_COUNT
    ? comments.slice(comments.length - VISIBLE_COMMENTS_COUNT)
    : comments

  useEffect(() => {
    if (user && ticketId) {
      loadComments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, user])

  const loadComments = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Build query based on role
      let query = supabase
        .from('ticket_comments')
        .select(`
          *,
          profile (id, nome_completo, avatar_url, role)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      // Citizens only see public comments + their own
      if (userRole === 'cidadao') {
        query = query.or(`publico.eq.true,autor_id.eq.${user.id}`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      if (data) {
        setComments(data as TicketCommentWithAuthor[])
      }
    } catch (err) {
      const appError = logError(err, 'TicketComments.loadComments')
      setError(appError.userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || !user) return

    // Optimistic update - add comment immediately
    const optimisticComment: TicketCommentWithAuthor = {
      id: `temp-${Date.now()}`,
      ticket_id: ticketId,
      autor_id: user.id,
      mensagem: newComment.trim(),
      publico: isPublic,
      anexos: [],
      metadata: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        id: user.id,
        nome_completo: user.user_metadata?.nome_completo || user.email || 'Você',
        avatar_url: user.user_metadata?.avatar_url || null,
        role: userRole,
      },
    }

    setComments((prev) => [...prev, optimisticComment])
    setNewComment('')
    const previousIsPublic = isPublic
    setIsPublic(true)
    setSubmitting(true)
    setError(null)

    // Scroll to bottom after adding comment
    setTimeout(scrollToBottom, 100)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          autor_id: user.id,
          mensagem: optimisticComment.mensagem,
          publico: previousIsPublic,
        })
        .select(`
          *,
          profile (id, nome_completo, avatar_url, role)
        `)
        .single()

      if (insertError) throw insertError

      // Replace optimistic comment with real one
      if (data) {
        setComments((prev) =>
          prev.map((c) => (c.id === optimisticComment.id ? (data as TicketCommentWithAuthor) : c))
        )
      }
    } catch (err) {
      // Remove optimistic comment on error
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id))
      setNewComment(optimisticComment.mensagem)
      setIsPublic(previousIsPublic)
      const appError = logError(err, 'TicketComments.handleSubmit')
      setError(appError.userMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const canAddPrivateComments = userRole !== 'cidadao'

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 mb-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Comments List - Scrollable */}
      <div ref={commentsListRef} className="flex-1 overflow-y-auto pr-2 mb-4 min-h-0">
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Carregando comentários...
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-lg bg-muted/50 p-8 text-center text-sm text-muted-foreground">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </div>
        ) : (
          <div className="space-y-3">
            {/* Older comments accordion */}
            {olderComments.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowOlderComments(!showOlderComments)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors border border-dashed"
                >
                  <svg
                    className={`h-4 w-4 transition-transform ${showOlderComments ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="font-medium">
                    {showOlderComments ? 'Ocultar' : 'Mostrar'} {olderComments.length} comentário{olderComments.length > 1 ? 's' : ''} anterior{olderComments.length > 1 ? 'es' : ''}
                  </span>
                </button>

                {showOlderComments && (
                  <div className="mt-3 space-y-3 animate-in slide-in-from-top duration-200">
                    {olderComments.map((comment) => {
                      const isBackoffice = Boolean(comment.profile?.role && ['assessor', 'politico', 'admin'].includes(comment.profile.role))
                      const isPrivate = !comment.publico

                      return (
                        <CommentCard
                          key={comment.id}
                          comment={comment}
                          isBackoffice={isBackoffice}
                          isPrivate={isPrivate}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Recent comments - always visible */}
            {recentComments.map((comment) => {
              const isBackoffice = Boolean(comment.profile?.role && ['assessor', 'politico', 'admin'].includes(comment.profile.role))
              const isPrivate = !comment.publico

              return (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  isBackoffice={isBackoffice}
                  isPrivate={isPrivate}
                />
              )
            })}

            {/* Scroll anchor */}
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>

      {/* New Comment Form - Fixed at bottom */}
      <div className="border-t pt-4 bg-background">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva seu comentário..."
              className="min-h-[80px] resize-none"
              disabled={submitting}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {canAddPrivateComments && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isPublic" className="text-xs font-normal cursor-pointer">
                  Público
                </Label>
              </div>
            )}

            <Button type="submit" disabled={submitting || !newComment.trim()} size="sm" className="ml-auto">
              {submitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
