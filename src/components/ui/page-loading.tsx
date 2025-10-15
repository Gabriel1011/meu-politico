'use client'

import { cn } from '@/lib/utils'

interface PageLoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export function PageLoading({ className, size = 'md', fullScreen = true }: PageLoadingProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  }

  const logoSizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
        !fullScreen && 'w-full h-full min-h-[200px]',
        className
      )}
    >
      <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
        {/* Spinning circle */}
        <div
          className={cn(
            'absolute inset-0 rounded-full border-4 border-muted',
            'border-t-primary border-r-primary/60',
            'animate-spin'
          )}
          style={{
            animationDuration: '1s',
          }}
        />

        {/* Logo/Icon in the center */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'font-bold text-primary'
          )}
        >
          <svg
            viewBox="0 0 100 100"
            className={cn('p-2', logoSizeClasses[size])}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* MP Icon - stylized letters */}
            <path
              d="M20 30 L20 70 L30 70 L30 45 L40 60 L50 45 L50 70 L60 70 L60 30 L50 30 L40 50 L30 30 Z"
              fill="currentColor"
            />
            <path
              d="M70 30 L70 70 L80 70 L80 50 L85 50 C88 50 90 48 90 45 L90 35 C90 32 88 30 85 30 Z M80 40 L80 40 L85 40 L85 45 L80 45 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
