'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DepartmentSummary } from '@/lib/types'

interface DepartmentPerformanceChartProps {
  data: DepartmentSummary[]
}

export default function DepartmentPerformanceChart({ data }: DepartmentPerformanceChartProps) {
  const chartData = data.map((dept) => ({
    name: dept.department_name,
    completed: dept.completed_goals,
    onTrack: dept.on_track_goals,
    atRisk: dept.at_risk_goals,
    offTrack: dept.off_track_goals,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="completed" fill="#10b981" name="Completed" />
        <Bar dataKey="onTrack" fill="#3b82f6" name="On Track" />
        <Bar dataKey="atRisk" fill="#f59e0b" name="At Risk" />
        <Bar dataKey="offTrack" fill="#ef4444" name="Off Track" />
      </BarChart>
    </ResponsiveContainer>
  )
}
