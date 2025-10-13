'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Bell,
  Calendar,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DashboardSidebarProps {
  userRole: string
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

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

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/painel',
      Icon: LayoutDashboard,
      roles: ['cidadao', 'assessor', 'politico', 'admin'],
    },
    {
      name: 'Ocorrências',
      href: '/painel/ocorrencias',
      Icon: FileText,
      roles: ['cidadao', 'assessor', 'politico', 'admin'],
    },
    {
      name: 'Notificações',
      href: '/painel/notificacoes',
      Icon: Bell,
      roles: ['cidadao', 'assessor', 'politico', 'admin', 'superadmin'],
    },
    {
      name: 'Agenda',
      href: '/painel/agenda',
      Icon: Calendar,
      roles: ['cidadao', 'assessor', 'politico', 'admin'],
    },
    {
      name: 'Configurações',
      href: '/painel/configuracoes',
      Icon: Settings,
      roles: ['politico', 'admin'],
    },
    {
      name: 'Usuários',
      href: '/painel/usuarios',
      Icon: Users,
      roles: ['politico'],
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
    <TooltipProvider delayDuration={0}>
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
          'fixed top-0 left-0 h-screen border-r bg-white z-40 transition-all duration-300 ease-in-out',
          'flex flex-col',
          isMobile && !isOpen && '-translate-x-full',
          isMobile && isOpen && 'translate-x-0 w-64',
          !isMobile && isCollapsed && 'w-16',
          !isMobile && !isCollapsed && 'w-64'
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
        <nav
          className={cn(
            'flex-1 overflow-y-auto custom-scrollbar transition-all duration-300',
            isCollapsed && !isMobile ? 'p-2' : 'p-4'
          )}
        >
          <div className="space-y-2">
            {/* Desktop Toggle Button - First Item */}
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleCollapsed}
                    className={cn(
                      'flex items-center rounded-lg text-sm font-medium transition-all w-full',
                      'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
                      'hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                    )}
                    aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-5 w-5 shrink-0" />
                    ) : (
                      <>
                        <ChevronLeft className="h-5 w-5 shrink-0" />
                        <span className="truncate">Recolher</span>
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Expandir menu</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )}

            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center rounded-lg text-sm font-medium transition-all',
                    'active:scale-95 touch-manipulation',
                    'hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
                    isCollapsed && !isMobile ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                  )}
                >
                  <item.Icon className="h-5 w-5 shrink-0" />
                  {(!isCollapsed || isMobile) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              )

              // Show tooltip only on desktop collapsed mode
              if (!isMobile && isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t bg-gray-50">
          {(!isCollapsed || isMobile) && (
            <p className="text-xs text-gray-500 text-center">
              Meu Político v1.0
            </p>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
