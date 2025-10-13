'use client'

import { DashboardSidebar } from './dashboard-sidebar'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/use-sidebar'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  userRole: string
}

export function DashboardLayoutClient({
  children,
  userRole,
}: DashboardLayoutClientProps) {
  const sidebarCollapsed = useSidebar()

  return (
    <div className="flex flex-1 overflow-hidden">
      <DashboardSidebar userRole={userRole} />
      <main
        className={cn(
          'flex-1 overflow-y-auto custom-scrollbar transition-all duration-300',
          'lg:ml-64', // Default: expanded sidebar width (256px)
          sidebarCollapsed && 'lg:ml-16' // Collapsed: 64px (w-16)
        )}
      >
        <div
          className={cn(
            'mx-auto p-4 sm:p-6 lg:p-8 pb-safe transition-all duration-300',
            // Responsive max-width based on sidebar state
            sidebarCollapsed ? 'max-w-[1920px] px-6' : 'max-w-7xl'
          )}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
