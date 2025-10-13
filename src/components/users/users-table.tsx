'use client'

import { useState } from 'react'
import { type UserWithAuth } from '@/services/users.service'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, ChevronLeft, ChevronRight, Edit, UserX, UserCheck } from 'lucide-react'
import { UserFormDialog } from './user-form-dialog'
import { usersService } from '@/services/users.service'

interface UsersTableProps {
  users: UserWithAuth[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onRefresh: () => void
}

const ROLE_LABELS: Record<string, string> = {
  cidadao: 'Cidadão',
  assessor: 'Assessor',
  politico: 'Político',
}

const ROLE_COLORS: Record<string, string> = {
  cidadao: 'bg-gray-100 text-gray-800 border-gray-800',
  assessor: 'bg-blue-100 text-blue-800 border-blue-800',
  politico: 'bg-purple-100 text-purple-800 border-purple-800',
}

export function UsersTable({
  users,
  loading,
  page,
  totalPages,
  onPageChange,
  onRefresh,
}: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<UserWithAuth | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const getInitials = (nome_completo: string | null) => {
    if (!nome_completo) return '??'
    const parts = nome_completo.split(' ')
    const first = parts[0]?.charAt(0) || ''
    const last = parts[parts.length - 1]?.charAt(0) || ''
    return (first + last).toUpperCase()
  }

  const handleEditUser = (user: UserWithAuth) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = async (user: UserWithAuth) => {
    try {
      await usersService.deleteUser(user.id)
      alert('Usuário removido com sucesso')
      onRefresh()
    } catch (error) {
      alert('Erro ao remover usuário')
    }
  }

  const handleUpdateRole = async (user: UserWithAuth, newRole: UserWithAuth['role']) => {
    try {
      await usersService.updateUserRole(user.id, newRole)
      alert(`Perfil atualizado para ${ROLE_LABELS[newRole]}`)
      onRefresh()
    } catch (error) {
      alert('Erro ao atualizar perfil')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Carregando usuários...</div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Data Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.nome_completo)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.nome_completo || 'Sem nome'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.email || '-'}
                </TableCell>
                <TableCell>
                  <Badge className={ROLE_COLORS[user.role]} variant="secondary">
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="default">
                    Ativo
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Alterar Perfil
                      </DropdownMenuLabel>
                      {(['cidadao', 'assessor', 'politico'] as const).map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleUpdateRole(user, role)}
                          disabled={user.role === role}
                        >
                          {ROLE_LABELS[role]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingUser && (
        <UserFormDialog
          user={editingUser}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onRefresh}
        />
      )}
    </div>
  )
}
