export type Role = 'ceo' | 'employee'

export type GoalStatus = 'not_started' | 'on_track' | 'at_risk' | 'off_track' | 'completed'

export interface Department {
  id: string
  name: string
}

export interface User {
  id: string
  auth_user_id: string
  full_name: string
  role: Role
  department_id: string | null
  department?: Department
}

export interface Goal {
  id: string
  title: string
  description: string
  department_id: string
  owner_user_id: string | null
  target_value: number
  current_value: number
  unit: string
  start_date: string
  due_date: string
  status: GoalStatus
  department?: Department
  owner?: User
}

export interface Progress {
  id: string
  goal_id: string
  user_id: string
  value: number
  note: string
  created_at: string
  user?: User
}

export interface Upload {
  id: string
  goal_id: string
  user_id: string
  url: string | null
  file_path: string | null
  created_at: string
  user?: User
}

export interface DashboardKPI {
  label: string
  value: number | string
  target?: number
  percentage?: number
  trend?: 'up' | 'down' | 'neutral'
  unit?: string
}

export interface DepartmentSummary {
  department_id: string
  department_name: string
  total_goals: number
  completed_goals: number
  on_track_goals: number
  at_risk_goals: number
  off_track_goals: number
  completion_percentage: number
}
