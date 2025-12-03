'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface HealthDonutProps {
  onTrack: number
  atRisk: number
  offTrack: number
  completed: number
  notStarted: number
}

export default function HealthDonut({ onTrack, atRisk, offTrack, completed, notStarted }: HealthDonutProps) {
  const data = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'On Track', value: onTrack, color: '#3b82f6' },
    { name: 'At Risk', value: atRisk, color: '#f59e0b' },
    { name: 'Off Track', value: offTrack, color: '#ef4444' },
    { name: 'Not Started', value: notStarted, color: '#6b7280' },
  ].filter(item => item.value > 0)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
