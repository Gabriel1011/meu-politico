'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUserContext } from '@/hooks/use-user-context'
import { logError } from '@/lib/error-handler'
import type { TicketCommentWithAuthor, UserRole } from '@/types'

interface TicketCommentsProps {
  ticketId: string
  userRole: UserRole
}

export function TicketComments({ ticketId, userRole }: TicketCommentsProps) {
  const { user } = useUserContext()

  const [comments, setComments] = useState<TicketCommentWithAuthor[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isPublic, setIsPublic] = useState(true)

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

    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase.from('ticket_comments').insert({
        ticket_id: ticketId,
        autor_id: user.id,
        mensagem: newComment.trim(),
        publico: isPublic,
      })

      if (insertError) throw insertError

      setNewComment('')
      setIsPublic(true)
      loadComments()
    } catch (err) {
      const appError = logError(err, 'TicketComments.handleSubmit')
      setError(appError.userMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const canAddPrivateComments = userRole !== 'cidadao'

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-4 text-center text-sm text-gray-500">
          Carregando comentários...
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-gray-500">
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isBackoffice = comment.profile?.role && ['assessor', 'politico', 'admin'].includes(comment.profile.role)
            const isPrivate = !comment.publico

            // Define background color based on role and privacy
            let bgColor = 'bg-white border-gray-200'
            if (isPrivate) {
              bgColor = 'bg-yellow-50 border-yellow-200'
            } else if (isBackoffice) {
              bgColor = 'bg-blue-50 border-blue-200'
            }

            return (
              <div
                key={comment.id}
                className={`rounded-lg border p-4 ${bgColor}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-medium">
                    {comment.profile?.nome_completo?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.profile?.nome_completo || 'Usuário'}
                      </span>
                      {isBackoffice && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                          Equipe
                        </span>
                      )}
                      {isPrivate && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                          Interno
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDateTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.mensagem}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
        <div>
          <Label htmlFor="comment">Adicionar comentário</Label>
          <Textarea
            id="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva seu comentário..."
            className="mt-1 min-h-[100px]"
            disabled={submitting}
          />
        </div>

        {canAddPrivateComments && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isPublic" className="text-sm font-normal">
              Comentário público (visível para o cidadão)
            </Label>
          </div>
        )}

        <Button type="submit" disabled={submitting || !newComment.trim()}>
          {submitting ? 'Enviando...' : 'Enviar comentário'}
        </Button>
      </form>
    </div>
  )
}
