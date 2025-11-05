export default function RequestCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        {/* Title and status */}
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Status badge */}
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>

      {/* Info rows */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-28"></div>
        </div>
      </div>

      {/* Amount */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  )
}
