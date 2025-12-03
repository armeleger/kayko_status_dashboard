import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { DepartmentSummary } from '@/lib/types'

export async function GET(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*, department:departments(*)')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Get URL search params for filtering
  const { searchParams } = new URL(request.url)
  const departmentFilter = searchParams.get('department')

  // Fetch all departments
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (!departments) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }

  // Build department summaries
  const departmentSummaries: DepartmentSummary[] = []

  for (const dept of departments) {
    // Skip if filtering by department and this isn't it
    if (departmentFilter && dept.id !== departmentFilter) {
      continue
    }

    // For employees, only show their department
    if (profile.role === 'employee' && dept.id !== profile.department_id) {
      continue
    }

    // Fetch goals for this department
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('department_id', dept.id)

    const total_goals = goals?.length || 0
    const completed_goals = goals?.filter((g) => g.status === 'completed').length || 0
    const on_track_goals = goals?.filter((g) => g.status === 'on_track').length || 0
    const at_risk_goals = goals?.filter((g) => g.status === 'at_risk').length || 0
    const off_track_goals = goals?.filter((g) => g.status === 'off_track').length || 0
    const completion_percentage = total_goals > 0 ? (completed_goals / total_goals) * 100 : 0

    departmentSummaries.push({
      department_id: dept.id,
      department_name: dept.name,
      total_goals,
      completed_goals,
      on_track_goals,
      at_risk_goals,
      off_track_goals,
      completion_percentage,
    })
  }

  // Calculate global metrics
  const totalGoals = departmentSummaries.reduce((sum, d) => sum + d.total_goals, 0)
  const totalCompleted = departmentSummaries.reduce((sum, d) => sum + d.completed_goals, 0)
  const totalOnTrack = departmentSummaries.reduce((sum, d) => sum + d.on_track_goals, 0)
  const totalAtRisk = departmentSummaries.reduce((sum, d) => sum + d.at_risk_goals, 0)
  const totalOffTrack = departmentSummaries.reduce((sum, d) => sum + d.off_track_goals, 0)
  const globalCompletion = totalGoals > 0 ? (totalCompleted / totalGoals) * 100 : 0

  return NextResponse.json({
    departments: departmentSummaries,
    global: {
      total_goals: totalGoals,
      completed_goals: totalCompleted,
      on_track_goals: totalOnTrack,
      at_risk_goals: totalAtRisk,
      off_track_goals: totalOffTrack,
      completion_percentage: globalCompletion,
    },
  })
}
