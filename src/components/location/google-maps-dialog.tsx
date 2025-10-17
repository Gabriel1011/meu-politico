'use client'

import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { buildLocationAddress } from '@/lib/location'
import { cn } from '@/lib/utils'

type ButtonVariant = React.ComponentProps<typeof Button>['variant']
type ButtonSize = React.ComponentProps<typeof Button>['size']

interface GoogleMapsDialogProps {
  location: unknown
  triggerLabel?: string
  buttonVariant?: ButtonVariant
  buttonSize?: ButtonSize
  buttonClassName?: string
  disabled?: boolean
}

const MAPS_BASE_URL = 'https://maps.google.com/maps'

export function GoogleMapsDialog({
  location,
  triggerLabel = 'Ver no mapa',
  buttonVariant = 'outline',
  buttonSize = 'sm',
  buttonClassName,
  disabled,
}: GoogleMapsDialogProps) {
  const address = useMemo(() => buildLocationAddress(location), [location])

  const mapUrl = useMemo(() => {
    if (!address) return null
    const encoded = encodeURIComponent(address)
    return `${MAPS_BASE_URL}?q=${encoded}&t=&z=15&ie=UTF8&iwloc=&output=embed`
  }, [address])

  const isDisabled = disabled || !mapUrl

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={buttonVariant}
          size={buttonSize}
          className={cn('gap-2', buttonClassName)}
          disabled={isDisabled}
        >
          <MapPin className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Localização no mapa</DialogTitle>
          {address && (
            <DialogDescription>
              {address}
            </DialogDescription>
          )}
        </DialogHeader>
        {mapUrl ? (
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <iframe
              title="Mapa do Google Maps"
              src={mapUrl}
              allowFullScreen
              loading="lazy"
              className="h-full w-full border-0"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Não foi possível gerar o mapa para este endereço.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
