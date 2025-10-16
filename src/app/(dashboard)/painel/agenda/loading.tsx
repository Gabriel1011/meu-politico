import { EventsSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-64 bg-muted animate-pulse rounded" />
      </div>
      <EventsSkeleton />
    </div>
  )
}
