export default function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      {/* Chart title */}
      <div className="h-5 bg-gray-200 rounded w-48 mb-6"></div>

      {/* Chart bars */}
      <div className="flex items-end justify-between h-64 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-t"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          ></div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-12"></div>
        ))}
      </div>
    </div>
  )
}
