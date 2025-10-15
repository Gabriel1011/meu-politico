'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PageLoading } from './page-loading'

export function PageTransition() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Show loading on route change
    setIsLoading(true)

    // Hide loading after a short delay to allow content to render
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!isLoading) return null

  return <PageLoading />
}
