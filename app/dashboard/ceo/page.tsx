'use client'

import { useEffect, useState } from 'react'
import KpiCard from '@/components/KpiCard'
import SectionCard from '@/components/SectionCard'
import GoalList from '@/components/GoalList'
import DepartmentPerformanceChart from '@/components/charts/DepartmentPerformanceChart'
import HealthDonut from '@/components/charts/HealthDonut'
import { DepartmentSummary, Goal } from '@/lib/types'
import { createClient } from '@/lib/supabaseClient'

export default function CEODashboardPage() {
  const [summary, setSummary] = useState<{
    departments: DepartmentSummary[]
    global: any
  } | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch summary
      const summaryRes = await fetch('/api/dashboard/summary')
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      }

      // Fetch recent goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*, department:departments(*), owner:users(*)')
        .order('created_at', { ascending: false })
        .limit(10)

      if (goalsData) {
        setGoals(goalsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return <div className="p-8">Failed to load dashboard data</div>
  }

  const globalKpis = [
    {
      label: 'Total Goals',
      value: summary.global.total_goals,
      unit: '',
      trend: 'neutral' as const,
    },
    {
      label: 'Completion Rate',
      value: summary.global.completion_percentage.toFixed(1),
      unit: '%',
      percentage: summary.global.completion_percentage,
      trend: summary.global.completion_percentage >= 75 ? 'up' as const : 'down' as const,
    },
    {
      label: 'On Track',
      value: summary.global.on_track_goals,
      unit: '',
      trend: 'up' as const,
    },
    {
      label: 'At Risk',
      value: summary.global.at_risk_goals + summary.global.off_track_goals,
      unit: '',
      trend: 'down' as const,
    },
  ]

  // Group departments by category (Sales, Revenue, Marketing, etc.)
  const departmentSections = [
    { name: 'Sales', icon: '💰', deptName: 'Sales' },
    { name: 'Revenue', icon: '📊', deptName: 'Revenue' },
    { name: 'Marketing', icon: '📢', deptName: 'Marketing' },
    { name: 'Product Performance', icon: '🚀', deptName: 'Product Performance' },
    { name: 'Support', icon: '🎧', deptName: 'Support' },
    { name: 'Growth', icon: '📈', deptName: 'Growth' },
    { name: 'DevOps', icon: '⚙️', deptName: 'DevOps' },
    { name: 'Compliance', icon: '✅', deptName: 'Compliance' },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Executive Overview</h1>
        <p className="text-gray-600 mt-2">Real-time insights across all departments</p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {globalKpis.map((kpi, index) => (
          <KpiCard key={index} kpi={kpi} />
        ))}
      </div>

      {/* Department Performance Chart */}
      <SectionCard
        title="Department Performance Overview"
        description="Goal status distribution across departments"
      >
        <DepartmentPerformanceChart data={summary.departments} />
      </SectionCard>

      {/* Goal Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Goal Health Distribution" description="Overall goal status breakdown">
          <HealthDonut
            completed={summary.global.completed_goals}
            onTrack={summary.global.on_track_goals}
            atRisk={summary.global.at_risk_goals}
            offTrack={summary.global.off_track_goals}
            notStarted={
              summary.global.total_goals -
              (summary.global.completed_goals +
                summary.global.on_track_goals +
                summary.global.at_risk_goals +
                summary.global.off_track_goals)
            }
          />
        </SectionCard>

        {/* Recent Goals */}
        <SectionCard title="Recent Goals" description="Latest goals across all departments">
          <GoalList goals={goals} showDepartment showOwner allowEdit />
        </SectionCard>
      </div>

      {/* Department Sections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Department Details</h2>
        {departmentSections.map((section) => {
          const deptSummary = summary.departments.find((d) => d.department_name === section.deptName)
          const deptGoals = goals.filter((g) => g.department?.name === section.deptName).slice(0, 5)

          if (!deptSummary) return null

          const deptKpis = [
            {
              label: 'Total Goals',
              value: deptSummary.total_goals,
              unit: '',
            },
            {
              label: 'Completed',
              value: deptSummary.completed_goals,
              unit: '',
              percentage: deptSummary.completion_percentage,
            },
            {
              label: 'On Track',
              value: deptSummary.on_track_goals,
              unit: '',
            },
            {
              label: 'At Risk',
              value: deptSummary.at_risk_goals + deptSummary.off_track_goals,
              unit: '',
            },
          ]

          return (
            <SectionCard
              key={section.deptName}
              title={section.name}
              icon={section.icon}
              description={`Performance metrics and goals for ${section.name}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {deptKpis.map((kpi, idx) => (
                  <KpiCard key={idx} kpi={kpi} />
                ))}
              </div>
              {deptGoals.length > 0 && (
                <GoalList goals={deptGoals} showOwner allowEdit />
              )}
            </SectionCard>
          )
        })}
      </div>
    </div>
  )
}
