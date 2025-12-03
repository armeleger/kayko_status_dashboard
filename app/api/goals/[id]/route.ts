import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: goal, error } = await supabase
    .from('goals')
    .select('*, department:departments(*), owner:users(*)')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
  }

  return NextResponse.json(goal)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

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

  const updateData: any = {}
  if (body.title !== undefined) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description
  if (body.department_id !== undefined) updateData.department_id = body.department_id
  if (body.owner_user_id !== undefined) updateData.owner_user_id = body.owner_user_id
  if (body.target_value !== undefined) updateData.target_value = body.target_value
  if (body.current_value !== undefined) updateData.current_value = body.current_value
  if (body.unit !== undefined) updateData.unit = body.unit
  if (body.start_date !== undefined) updateData.start_date = body.start_date
  if (body.due_date !== undefined) updateData.due_date = body.due_date
  if (body.status !== undefined) updateData.status = body.status

  const { data: goal, error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(goal)
}
