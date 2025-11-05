export default function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        {/* Icon skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>

        <div className="flex-1">
          {/* Number skeleton */}
          <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>

          {/* Label skeleton */}
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  )
}
