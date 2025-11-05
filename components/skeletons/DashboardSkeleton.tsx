import StatCardSkeleton from './StatCardSkeleton'
import ChartSkeleton from './ChartSkeleton'
import RequestCardSkeleton from './RequestCardSkeleton'

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <RequestCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
