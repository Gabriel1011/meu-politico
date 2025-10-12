'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface DashboardSidebarProps {
  userRole: string
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/painel',
      icon: '📊',
      roles: ['cidadao', 'assessor', 'politico', 'admin'],
    },
    {
      name: 'Ocorrências',
      href: '/painel/ocorrencias',
      icon: '📝',
      roles: ['cidadao', 'assessor', 'politico', 'admin'],
    },
    {
      name: 'Nova Ocorrência',
      href: '/painel/ocorrencias/nova',
      icon: '➕',
      roles: ['cidadao'],
    },
    {
      name: 'Agenda',
      href: '/painel/agenda',
      icon: '📅',
      roles: ['assessor', 'politico', 'admin'],
    },
    {
      name: 'Configurações',
      href: '/painel/configuracoes',
      icon: '⚙️',
      roles: ['politico', 'admin'],
    },
    {
      name: 'Equipe',
      href: '/painel/equipe',
      icon: '👥',
      roles: ['politico', 'admin'],
    },
  ]

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <aside className="w-64 border-r bg-white p-4">
      <nav className="space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
