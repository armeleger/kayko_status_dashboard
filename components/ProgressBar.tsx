interface ProgressBarProps {
  percentage: number
  label?: string
  showPercentage?: boolean
}

export default function ProgressBar({
  percentage,
  label,
  showPercentage = true,
}: ProgressBarProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)

  const getColor = () => {
    if (clampedPercentage >= 75) return 'bg-green-500'
    if (clampedPercentage >= 50) return 'bg-yellow-500'
    if (clampedPercentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900">
              {clampedPercentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  )
}
