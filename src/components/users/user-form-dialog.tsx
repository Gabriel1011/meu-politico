'use client'

import { useState } from 'react'
import { type UserWithAuth } from '@/services/users.service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usersService } from '@/services/users.service'
import { Loader2 } from 'lucide-react'

interface UserFormDialogProps {
  user: UserWithAuth
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const ROLE_LABELS = {
  cidadao: 'Cidadão',
  assessor: 'Assessor',
  politico: 'Político',
}

export function UserFormDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: user.nome_completo || '',
    role: user.role,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await usersService.updateUser(user.id, {
        nome_completo: formData.nome_completo || null,
        role: formData.role,
      })

      alert('Usuário atualizado com sucesso!')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      alert('Erro ao atualizar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>

            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome_completo">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) =>
                  setFormData({ ...formData, nome_completo: e.target.value })
                }
                required
                placeholder="Digite o nome completo"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Perfil <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cidadao">Cidadão</SelectItem>
                  <SelectItem value="assessor">Assessor</SelectItem>
                  <SelectItem value="politico">Político</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
