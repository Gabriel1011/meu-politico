'use client'

import { create } from 'zustand'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AlertState {
  isOpen: boolean
  title: string
  description: string
  confirmText: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  variant?: 'default' | 'destructive'
}

interface AlertStore extends AlertState {
  showAlert: (config: Omit<AlertState, 'isOpen'>) => void
  hideAlert: () => void
}

const useAlertStore = create<AlertStore>((set) => ({
  isOpen: false,
  title: '',
  description: '',
  confirmText: 'OK',
  cancelText: undefined,
  onConfirm: undefined,
  onCancel: undefined,
  variant: 'default',
  showAlert: (config) => set({ ...config, isOpen: true }),
  hideAlert: () =>
    set({
      isOpen: false,
      title: '',
      description: '',
      confirmText: 'OK',
      cancelText: undefined,
      onConfirm: undefined,
      onCancel: undefined,
      variant: 'default',
    }),
}))

export function useAlert() {
  const store = useAlertStore()

  const alert = (title: string, description: string) => {
    return new Promise<void>((resolve) => {
      store.showAlert({
        title,
        description,
        confirmText: 'OK',
        onConfirm: () => {
          store.hideAlert()
          resolve()
        },
      })
    })
  }

  const confirm = (
    title: string,
    description: string,
    options?: {
      confirmText?: string
      cancelText?: string
      variant?: 'default' | 'destructive'
    }
  ) => {
    return new Promise<boolean>((resolve) => {
      store.showAlert({
        title,
        description,
        confirmText: options?.confirmText || 'Confirmar',
        cancelText: options?.cancelText || 'Cancelar',
        variant: options?.variant || 'default',
        onConfirm: () => {
          store.hideAlert()
          resolve(true)
        },
        onCancel: () => {
          store.hideAlert()
          resolve(false)
        },
      })
    })
  }

  return { alert, confirm }
}

export function AlertProvider() {
  const {
    isOpen,
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    variant,
    hideAlert,
  } = useAlertStore()

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && hideAlert()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelText && (
            <AlertDialogCancel
              onClick={() => {
                onCancel?.()
                hideAlert()
              }}
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={() => {
              onConfirm?.()
              hideAlert()
            }}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
