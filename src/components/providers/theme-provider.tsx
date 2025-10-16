'use client'

import { useEffect, useMemo } from 'react'
import { generateThemeVariables, type TenantColors } from '@/lib/color-utils'

interface ThemeProviderProps {
  cores: TenantColors | null
  children: React.ReactNode
}

export function ThemeProvider({ cores, children }: ThemeProviderProps) {
  // Memoize variables generation to avoid recalculation
  const variables = useMemo(() => {
    if (!cores) return null
    return generateThemeVariables(cores)
  }, [cores])

  useEffect(() => {
    if (!variables) return

    // Aplica as variáveis CSS customizadas do tenant
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
  }, [variables])

  return <>{children}</>
}
