'use client'

import { useEffect } from 'react'

interface ThemeProviderProps {
  themeVars: Record<string, string>
  children: React.ReactNode
}

export function ThemeProvider({ themeVars, children }: ThemeProviderProps) {
  useEffect(() => {
    // Apply theme variables to document root
    const root = document.documentElement
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Cleanup on unmount
    return () => {
      Object.keys(themeVars).forEach((key) => {
        root.style.removeProperty(key)
      })
    }
  }, [themeVars])

  return <>{children}</>
}
