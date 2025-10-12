'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { TicketCommentWithAuthor, UserRole } from '@/types'

interface TicketCommentsProps {
  ticketId: string
  userRole: UserRole
}

export function TicketComments({ ticketId, userRole }: TicketCommentsProps) {
  const [comments, setComments] = useState<TicketCommentWithAuthor[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  useEffect(() => {
    loadComments()
  }, [ticketId])

  const loadComments = async () => {
    setLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Build query based on role
    let query = supabase
      .from('ticket_comments')
      .select(`
        *,
        profile (id, nome_completo, avatar_url)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    // Citizens only see public comments + their own
    if (userRole === 'cidadao') {
      query = query.or(`publico.eq.true,autor_id.eq.${user.id}`)
    }

    const { data } = await query

    if (data) {
      setComments(data as TicketCommentWithAuthor[])
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    setSubmitting(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('ticket_comments').insert({
      ticket_id: ticketId,
      autor_id: user.id,
      mensagem: newComment.trim(),
      publico: isPublic,
    })

    if (!error) {
      setNewComment('')
      setIsPublic(true)
      loadComments()
    }

    setSubmitting(false)
  }

  const canAddPrivateComments = userRole !== 'cidadao'

  return (
    <div className="space-y-4">
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
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-lg border p-4 ${
                !comment.publico ? 'bg-yellow-50 border-yellow-200' : 'bg-white'
              }`}
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
                    {!comment.publico && (
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
          ))}
        </div>
      )}

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
        <div>
          <Label htmlFor="comment">Adicionar comentário</Label>
          <textarea
            id="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva seu comentário..."
            className="mt-1 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
