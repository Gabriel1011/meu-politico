'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardSidebarProps {
  userRole: string
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Menu Button - Hamburguer (apenas quando fechado) */}
      {isMobile && !isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-2 sm:top-3 left-4 z-50 lg:hidden h-10 w-10"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static top-0 left-0 h-screen lg:h-auto w-64 border-r bg-white z-40 transition-transform duration-300 ease-in-out',
          'flex flex-col',
          isMobile && !isOpen && '-translate-x-full',
          isMobile && isOpen && 'translate-x-0'
        )}
      >
        {/* Sidebar Header - apenas mobile */}
        {isMobile && (
          <div className="p-4 border-b lg:hidden flex items-center justify-between">
            <h2 className="text-lg font-bold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    'active:scale-95 touch-manipulation',
                    'hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                  )}
                >
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Meu Político v1.0
          </p>
        </div>
      </aside>
    </>
  )
}
