'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, GripVertical, Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Category = Database['public']['Tables']['categories']['Row']

interface CategoriesSettingsProps {
  tenantId: string
  categories: Category[]
}

export function CategoriesSettings({ tenantId, categories: initialCategories }: CategoriesSettingsProps) {
  const router = useRouter()
  const supabase = createClient()

  const [categories, setCategories] = useState(initialCategories)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)

  // Form states
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState('#6B7280')
  const [icone, setIcone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setNome('')
    setCor('#6B7280')
    setIcone('')
    setEditingCategory(null)
  }

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setNome(category.nome)
      setCor(category.cor || '#6B7280')
      setIcone(category.icone || '')
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setTimeout(resetForm, 200) // Aguarda animação do dialog
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      toast.error('O nome da categoria é obrigatório')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingCategory) {
        // Atualizar categoria existente
        const { data, error } = await supabase
          .from('categories')
          .update({
            nome: nome.trim(),
            cor: cor,
            icone: icone.trim() || null,
          })
          .eq('id', editingCategory.id)
          .select()
          .single()

        if (error) throw error

        setCategories(prev =>
          prev.map(cat => (cat.id === editingCategory.id ? data : cat))
        )
        toast.success('Categoria atualizada com sucesso')
      } else {
        // Criar nova categoria
        const maxOrdem = Math.max(...categories.map(cat => cat.ordem), 0)

        const { data, error } = await supabase
          .from('categories')
          .insert({
            tenant_id: tenantId,
            nome: nome.trim(),
            cor: cor,
            icone: icone.trim() || null,
            ordem: maxOrdem + 1,
            ativa: true,
          })
          .select()
          .single()

        if (error) throw error

        setCategories(prev => [...prev, data])
        toast.success('Categoria criada com sucesso')
      }

      closeDialog()
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error)
      if (error?.code === '23505') {
        toast.error('Já existe uma categoria com esse nome')
      } else {
        toast.error('Erro ao salvar categoria')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)

      if (error) throw error

      setCategories(prev => prev.filter(cat => cat.id !== id))
      toast.success('Categoria excluída com sucesso')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error)
      if (error?.code === '23503') {
        toast.error('Não é possível excluir uma categoria que possui ocorrências vinculadas')
      } else {
        toast.error('Erro ao excluir categoria')
      }
    } finally {
      setDeletingCategoryId(null)
    }
  }

  const toggleActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ ativa: !category.ativa })
        .eq('id', category.id)

      if (error) throw error

      setCategories(prev =>
        prev.map(cat =>
          cat.id === category.id ? { ...cat, ativa: !cat.ativa } : cat
        )
      )
      toast.success(
        category.ativa
          ? 'Categoria desativada com sucesso'
          : 'Categoria ativada com sucesso'
      )
      router.refresh()
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      toast.error('Erro ao atualizar categoria')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categorias de Ocorrências</CardTitle>
              <CardDescription>
                Gerencie as categorias disponíveis para classificação de ocorrências
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCategory
                        ? 'Atualize as informações da categoria'
                        : 'Crie uma nova categoria para classificar ocorrências'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">
                        Nome <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Iluminação Pública"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cor">Cor</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="cor"
                            type="text"
                            value={cor}
                            onChange={(e) => setCor(e.target.value)}
                            placeholder="#6B7280"
                            className="pr-12"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div
                              className="h-6 w-6 rounded border"
                              style={{ backgroundColor: cor }}
                            />
                          </div>
                        </div>
                        <Input
                          type="color"
                          value={cor}
                          onChange={(e) => setCor(e.target.value)}
                          className="w-14 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icone">Ícone (opcional)</Label>
                      <Input
                        id="icone"
                        value={icone}
                        onChange={(e) => setIcone(e.target.value)}
                        placeholder="Ex: lightbulb (nome do ícone Lucide)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Nome do ícone da biblioteca Lucide Icons
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialog}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria cadastrada
              </p>
              <p className="text-xs text-muted-foreground">
                Crie categorias para organizar as ocorrências
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories
                .sort((a, b) => a.ordem - b.ordem)
                .map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />

                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.cor || '#6B7280' }}
                    />

                    <div className="flex-1">
                      <p className="font-medium">{category.nome}</p>
                      {category.icone && (
                        <p className="text-xs text-muted-foreground">
                          Ícone: {category.icone}
                        </p>
                      )}
                    </div>

                    <Badge variant={category.ativa ? 'default' : 'secondary'}>
                      {category.ativa ? 'Ativa' : 'Inativa'}
                    </Badge>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(category)}
                        title={category.ativa ? 'Desativar' : 'Ativar'}
                      >
                        {category.ativa ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCategoryId(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Dialog para confirmação de exclusão */}
      <AlertDialog
        open={!!deletingCategoryId}
        onOpenChange={(open) => !open && setDeletingCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser
              desfeita. Categorias com ocorrências vinculadas não podem ser excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCategoryId && handleDelete(deletingCategoryId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
