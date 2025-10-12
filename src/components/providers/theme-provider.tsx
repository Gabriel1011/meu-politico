'use client'

import { useEffect } from 'react'
import { generateThemeVariables, type TenantColors } from '@/lib/color-utils'

interface ThemeProviderProps {
  cores: TenantColors | null
  children: React.ReactNode
}

export function ThemeProvider({ cores, children }: ThemeProviderProps) {
  useEffect(() => {
    if (!cores) return

    // Aplica as variáveis CSS customizadas do tenant
    const variables = generateThemeVariables(cores)
    const root = document.documentElement

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Cleanup: restaura os valores padrão ao desmontar
    return () => {
      Object.keys(variables).forEach((key) => {
        root.style.removeProperty(key)
      })
    }
  }, [cores])

  return <>{children}</>
}
