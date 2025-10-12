'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/layout/notification-bell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings } from 'lucide-react'

interface DashboardHeaderProps {
  user: {
    nome_completo: string | null
    email: string
    avatar_url: string | null
  } | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-bold truncate max-w-[150px] sm:max-w-none lg:ml-0 ml-12">
            Meu Político
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationBell />
          {/* Desktop View */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium truncate max-w-[150px]">
                {user?.nome_completo || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                {user?.email}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="touch-manipulation active:scale-95 transition-transform"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>

          {/* Mobile View - Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full touch-manipulation active:scale-95 transition-transform"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar_url || ''} alt={user?.nome_completo || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user?.nome_completo)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.nome_completo || 'Usuário'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push('/painel/configuracoes')}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop Avatar */}
          <Avatar className="hidden md:block h-10 w-10">
            <AvatarImage src={user?.avatar_url || ''} alt={user?.nome_completo || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user?.nome_completo)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
