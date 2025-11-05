import StatCardSkeleton from './StatCardSkeleton'
import TableSkeleton from './TableSkeleton'

interface AdminPageSkeletonProps {
  statCards?: number
  tableColumns?: number
  tableRows?: number
}

export default function AdminPageSkeleton({
  statCards = 3,
  tableColumns = 5,
  tableRows = 5,
}: AdminPageSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
      </div>

      {/* Stats Grid */}
      {statCards > 0 && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(statCards, 4)}, 1fr)` }}
        >
          {Array.from({ length: statCards }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Data Table */}
      <TableSkeleton rows={tableRows} columns={tableColumns} />
    </div>
  )
}
