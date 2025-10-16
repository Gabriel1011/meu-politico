import { DashboardStatsSkeleton, RecentTicketsSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-9 w-64 bg-muted animate-pulse rounded" />
        <div className="h-5 w-48 bg-muted animate-pulse rounded mt-2" />
      </div>

      <DashboardStatsSkeleton />
      <RecentTicketsSkeleton />
    </div>
  )
}
