'use client'

import { useState, useEffect } from 'react'

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Load initial state
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }

    // Listen for changes
    const checkSidebarState = () => {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) {
        setIsCollapsed(saved === 'true')
      }
    }

    // Poll for changes (since localStorage events don't fire in the same tab)
    const interval = setInterval(checkSidebarState, 100)

    // Listen for storage changes from other tabs
    window.addEventListener('storage', checkSidebarState)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', checkSidebarState)
    }
  }, [])

  return isCollapsed
}
