import { DashboardKPI } from '@/lib/types'

interface KpiCardProps {
  kpi: DashboardKPI
}

export default function KpiCard({ kpi }: KpiCardProps) {
  const getTrendIcon = () => {
    if (kpi.trend === 'up') return '📈'
    if (kpi.trend === 'down') return '📉'
    return '➡️'
  }

  const getTrendColor = () => {
    if (kpi.trend === 'up') return 'text-green-600'
    if (kpi.trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{kpi.label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {kpi.value}
              {kpi.unit && <span className="text-lg ml-1">{kpi.unit}</span>}
            </p>
          </div>
          {kpi.target !== undefined && (
            <p className="text-sm text-gray-500 mt-1">
              Target: {kpi.target}{kpi.unit}
            </p>
          )}
        </div>
        {kpi.trend && (
          <span className={`text-2xl ${getTrendColor()}`}>{getTrendIcon()}</span>
        )}
      </div>

      {kpi.percentage !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{kpi.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                kpi.percentage >= 75
                  ? 'bg-green-500'
                  : kpi.percentage >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(kpi.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
