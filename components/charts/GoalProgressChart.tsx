'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Progress } from '@/lib/types'

interface GoalProgressChartProps {
  progressData: Progress[]
}

export default function GoalProgressChart({ progressData }: GoalProgressChartProps) {
  const chartData = progressData.map((progress) => ({
    date: new Date(progress.created_at).toLocaleDateString(),
    value: progress.value,
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Progress" />
      </LineChart>
    </ResponsiveContainer>
  )
}
