'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { UserPlus, User, Check } from 'lucide-react'
import { ticketsService } from '@/services/tickets.service'
import type { Profile } from '@/types'
import { logError } from '@/lib/error-handler'
import { cn } from '@/lib/utils'

type AssignedUser = Pick<Profile, 'id' | 'nome_completo' | 'avatar_url'>

interface TicketAssignAvatarProps {
  ticketId: string
  assignedUser: AssignedUser | null | undefined
  tenantId: string
  currentUserId: string
  canAssign: boolean
  onAssignChange?: (userId: string | null) => void
}

export function TicketAssignAvatar({
  ticketId,
  assignedUser,
  tenantId,
  currentUserId,
  canAssign,
  onAssignChange,
}: TicketAssignAvatarProps) {
  const [open, setOpen] = useState(false)
  const [staffMembers, setStaffMembers] = useState<AssignedUser[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Gera iniciais a partir do nome completo (primeiras letras do nome e sobrenome)
  const getInitials = (fullName: string | null | undefined): string => {
    if (!fullName) return '?'

    const names = fullName.trim().split(' ').filter(Boolean)
    if (names.length === 0) return '?'
    if (names.length === 1) return names[0].charAt(0).toUpperCase()

    // Primeira letra do primeiro nome + primeira letra do último nome
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  useEffect(() => {
    if (open && canAssign) {
      loadStaffMembers()
    }
  }, [open, canAssign])

  const loadStaffMembers = async () => {
    setIsLoading(true)
    try {
      const members = await ticketsService.getStaffMembers(tenantId)
      setStaffMembers(members)
    } catch (err) {
      logError(err, 'TicketAssignAvatar.loadStaffMembers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async (userId: string | null) => {
    try {
      await ticketsService.assignTicket(ticketId, userId)
      setOpen(false)
      onAssignChange?.(userId)
    } catch (err) {
      logError(err, 'TicketAssignAvatar.handleAssign')
    }
  }

  if (!canAssign && !assignedUser) {
    return null
  }

  if (!canAssign && assignedUser) {
    // Show only avatar, no interaction
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="h-10 w-10 border-2 border-primary shadow-sm">
              <AvatarImage src={assignedUser.avatar_url || undefined} />
              <AvatarFallback className="text-sm bg-primary/10 text-primary">
                {getInitials(assignedUser.nome_completo)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{assignedUser.nome_completo || 'Sem nome'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
            {assignedUser ? (
              <TooltipTrigger asChild>
                <button className="relative group">
                  <Avatar className="h-10 w-10 border-2 border-primary shadow-sm cursor-pointer transition-all group-hover:ring-2 group-hover:ring-primary">
                    <AvatarImage src={assignedUser.avatar_url || undefined} />
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {getInitials(assignedUser.nome_completo)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
            ) : (
              <TooltipTrigger asChild>
                <button className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/30 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center group">
                  <UserPlus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </TooltipTrigger>
            )}
          </PopoverTrigger>
          <TooltipContent>
            <p>{assignedUser ? assignedUser.nome_completo || 'Sem nome' : 'Atribuir ocorrência'}</p>
          </TooltipContent>
        </Tooltip>
      <PopoverContent className="w-64 p-2" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-1">
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Atribuir para
            </p>
          </div>

          {/* Unassign option */}
          {assignedUser && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-9"
              onClick={() => handleAssign(null)}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/30 flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-sm flex-1 text-left">Remover atribuição</span>
              </div>
            </Button>
          )}

          {/* Assign to me */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start h-9",
              assignedUser?.id === currentUserId && "bg-primary/10"
            )}
            onClick={() => handleAssign(currentUserId)}
          >
            <div className="flex items-center gap-2 w-full">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                  Eu
                </AvatarFallback>
              </Avatar>
              <span className="text-sm flex-1 text-left">Atribuir para mim</span>
              {assignedUser?.id === currentUserId && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
          </Button>

          <div className="h-px bg-border my-1" />

          {/* Other staff members */}
          {isLoading ? (
            <div className="px-2 py-3 text-xs text-muted-foreground text-center">
              Carregando...
            </div>
          ) : (
            staffMembers
              .filter((member) => member.id !== currentUserId)
              .map((member) => (
                <Button
                  key={member.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start h-9",
                    assignedUser?.id === member.id && "bg-primary/10"
                  )}
                  onClick={() => handleAssign(member.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-muted">
                        {getInitials(member.nome_completo)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1 text-left truncate">
                      {member.nome_completo || 'Sem nome'}
                    </span>
                    {assignedUser?.id === member.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                </Button>
              ))
          )}
        </div>
      </PopoverContent>
    </Popover>
    </TooltipProvider>
  )
}
