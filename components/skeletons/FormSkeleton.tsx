interface FormSkeletonProps {
  fields?: number
}

export default function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          {/* Label */}
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>

          {/* Input field */}
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      ))}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <div className="h-10 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  )
}
