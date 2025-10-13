'use client'

import { useEffect, useState } from 'react'
import { usersService, type UserWithAuth, type UserFilters } from '@/services/users.service'
import { UsersTable } from '@/components/users/users-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Users as UsersIcon } from 'lucide-react'
import { useUserContext } from '@/hooks/use-user-context'

export default function UsersPage() {
  const { tenantId } = useUserContext()

  const [users, setUsers] = useState<UserWithAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ cidadao: 0, assessor: 0, politico: 0 })

  const pageSize = 10

  // Fetch users
  useEffect(() => {
    if (!tenantId) return

    const fetchUsers = async () => {
      setLoading(true)
      try {
        const filters: UserFilters = {
          searchTerm: searchTerm || undefined,
          role: roleFilter !== 'all' ? roleFilter as any : undefined,
        }

        const response = await usersService.getUsers(tenantId, filters, { page, pageSize })
        setUsers(response.data)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [tenantId, searchTerm, roleFilter, page])

  // Fetch stats
  useEffect(() => {
    if (!tenantId) return

    const fetchStats = async () => {
      try {
        const counts = await usersService.getUsersCountByRole(tenantId)
        setStats(counts)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [tenantId])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value)
    setPage(1)
  }

  const handleRefresh = async () => {
    if (!tenantId) return

    setLoading(true)
    try {
      const filters: UserFilters = {
        searchTerm: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter as any : undefined,
      }

      const response = await usersService.getUsers(tenantId, filters, { page, pageSize })
      setUsers(response.data)
      setTotalPages(response.totalPages)
      setTotal(response.total)

      // Refresh stats
      const counts = await usersService.getUsersCountByRole(tenantId)
      setStats(counts)
    } catch (error) {
      console.error('Error refreshing users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os usuários do seu gabinete
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.cidadao + stats.assessor + stats.politico}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cidadãos</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cidadao}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessores</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assessor}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Políticos</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.politico}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>
                {total} {total === 1 ? 'usuário encontrado' : 'usuários encontrados'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="cidadao">Cidadão</SelectItem>
                <SelectItem value="assessor">Assessor</SelectItem>
                <SelectItem value="politico">Político</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <UsersTable
            users={users}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>
    </div>
  )
}
