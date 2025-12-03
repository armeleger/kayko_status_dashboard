import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET() {
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
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Build query based on role
  let query = supabase.from('goals').select('*, department:departments(*), owner:users(*)')

  // Employees only see their department goals
  if (profile.role === 'employee') {
    query = query.eq('department_id', profile.department_id)
  }

  const { data: goals, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(goals || [])
}

export async function POST(request: Request) {
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
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'ceo') {
    return NextResponse.json({ error: 'Forbidden - CEO only' }, { status: 403 })
  }

  const body = await request.json()

  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      title: body.title,
      description: body.description,
      department_id: body.department_id,
      owner_user_id: body.owner_user_id || null,
      target_value: body.target_value,
      current_value: body.current_value || 0,
      unit: body.unit || '%',
      start_date: body.start_date,
      due_date: body.due_date,
      status: body.status || 'not_started',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(goal, { status: 201 })
}
