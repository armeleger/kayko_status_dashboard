import Link from 'next/link'
import { Goal } from '@/lib/types'
import ProgressBar from './ProgressBar'

interface GoalListProps {
  goals: Goal[]
  showDepartment?: boolean
  showOwner?: boolean
  allowEdit?: boolean
}

export default function GoalList({
  goals,
  showDepartment = false,
  showOwner = false,
  allowEdit = false,
}: GoalListProps) {
  if (goals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No goals found.</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      on_track: 'bg-blue-100 text-blue-800',
      at_risk: 'bg-yellow-100 text-yellow-800',
      off_track: 'bg-red-100 text-red-800',
      not_started: 'bg-gray-100 text-gray-800',
    }

    const labels: Record<string, string> = {
      completed: 'Completed',
      on_track: 'On Track',
      at_risk: 'At Risk',
      off_track: 'Off Track',
      not_started: 'Not Started',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.not_started}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Goal</th>
            {showDepartment && (
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
            )}
            {showOwner && (
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Owner</th>
            )}
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Progress</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
            {allowEdit && (
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => {
            const percentage = goal.target_value > 0
              ? (goal.current_value / goal.target_value) * 100
              : 0

            return (
              <tr key={goal.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{goal.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </p>
                  </div>
                </td>
                {showDepartment && (
                  <td className="py-4 px-4 text-sm text-gray-700">
                    {goal.department?.name || 'N/A'}
                  </td>
                )}
                {showOwner && (
                  <td className="py-4 px-4 text-sm text-gray-700">
                    {goal.owner?.full_name || 'Unassigned'}
                  </td>
                )}
                <td className="py-4 px-4">
                  <div className="w-32">
                    <ProgressBar percentage={percentage} showPercentage={false} />
                    <span className="text-xs text-gray-600 mt-1">{percentage.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="py-4 px-4">{getStatusBadge(goal.status)}</td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {new Date(goal.due_date).toLocaleDateString()}
                </td>
                {allowEdit && (
                  <td className="py-4 px-4">
                    <Link
                      href={`/dashboard/goals/${goal.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
