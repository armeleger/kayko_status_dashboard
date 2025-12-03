'use client'

import { useEffect, useState } from 'react'
import KpiCard from '@/components/KpiCard'
import SectionCard from '@/components/SectionCard'
import GoalList from '@/components/GoalList'
import { Goal, Upload } from '@/lib/types'
import { createClient } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'

export default function EmployeeDashboardPage() {
  const { profile } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [myGoals, setMyGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [progressValue, setProgressValue] = useState('')
  const [progressNote, setProgressNote] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile?.department_id) {
      fetchGoals()
    }
  }, [profile])

  const fetchGoals = async () => {
    if (!profile?.department_id) return

    try {
      // Fetch all department goals
      const { data: deptGoals } = await supabase
        .from('goals')
        .select('*, department:departments(*), owner:users(*)')
        .eq('department_id', profile.department_id)
        .order('due_date', { ascending: true })

      if (deptGoals) {
        setGoals(deptGoals)
        // Filter goals assigned to this user
        const assignedGoals = deptGoals.filter((g) => g.owner_user_id === profile.id)
        setMyGoals(assignedGoals)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitProgress = async () => {
    if (!selectedGoal || !progressValue) return

    setSubmitting(true)
    try {
      const value = parseFloat(progressValue)
      if (isNaN(value)) {
        alert('Please enter a valid number for progress value')
        return
      }

      // Submit progress
      const { error: progressError } = await supabase.from('progress').insert({
        goal_id: selectedGoal.id,
        user_id: profile!.id,
        value,
        note: progressNote,
      })

      if (progressError) throw progressError

      // Update goal current value
      const newCurrentValue = selectedGoal.current_value + value
      const { error: updateError } = await supabase
        .from('goals')
        .update({ current_value: newCurrentValue })
        .eq('id', selectedGoal.id)

      if (updateError) throw updateError

      // Submit proof if provided
      if (proofUrl || proofFile) {
        let filePath = null
        if (proofFile) {
          const fileExt = proofFile.name.split('.').pop()
          const fileName = `${profile!.id}/${Date.now()}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('proof_uploads')
            .upload(fileName, proofFile)

          if (uploadError) {
            console.error('File upload error:', uploadError)
          } else {
            filePath = fileName
          }
        }

        await supabase.from('uploads').insert({
          goal_id: selectedGoal.id,
          user_id: profile!.id,
          url: proofUrl || null,
          file_path: filePath,
        })
      }

      alert('Progress submitted successfully!')
      setSelectedGoal(null)
      setProgressValue('')
      setProgressNote('')
      setProofUrl('')
      setProofFile(null)
      fetchGoals()
    } catch (error) {
      console.error('Error submitting progress:', error)
      alert('Failed to submit progress')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!profile?.department) {
    return <div className="p-8">No department assigned. Contact your administrator.</div>
  }

  const completedGoals = myGoals.filter((g) => g.status === 'completed').length
  const totalMyGoals = myGoals.length
  const completionPercentage = totalMyGoals > 0 ? (completedGoals / totalMyGoals) * 100 : 0

  const kpis = [
    {
      label: 'My Goals',
      value: totalMyGoals,
      unit: '',
    },
    {
      label: 'Completed',
      value: completedGoals,
      unit: '',
      percentage: completionPercentage,
    },
    {
      label: 'In Progress',
      value: myGoals.filter((g) => ['on_track', 'at_risk'].includes(g.status)).length,
      unit: '',
    },
    {
      label: 'Department Goals',
      value: goals.length,
      unit: '',
    },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {profile.department.name} Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Track your goals and submit progress updates</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KpiCard key={index} kpi={kpi} />
        ))}
      </div>

      {/* My Assigned Goals */}
      <SectionCard
        title="My Assigned Goals"
        icon="🎯"
        description="Goals assigned to you"
      >
        {myGoals.length > 0 ? (
          <>
            <GoalList goals={myGoals} showOwner={false} />
            <div className="mt-6">
              <button
                onClick={() => {
                  if (myGoals.length > 0) {
                    setSelectedGoal(myGoals[0])
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Progress Update
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No goals assigned yet.</p>
        )}
      </SectionCard>

      {/* All Department Goals */}
      <SectionCard
        title="All Department Goals"
        description={`All goals in ${profile.department.name}`}
      >
        <GoalList goals={goals} showOwner />
      </SectionCard>

      {/* Progress Submission Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Submit Progress</h2>
            <p className="text-gray-600 mb-6">Goal: {selectedGoal.title}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Goal
                </label>
                <select
                  value={selectedGoal.id}
                  onChange={(e) => {
                    const goal = myGoals.find((g) => g.id === e.target.value)
                    if (goal) setSelectedGoal(goal)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {myGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Value ({selectedGoal.unit})
                </label>
                <input
                  type="number"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder={`Enter value in ${selectedGoal.unit}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {selectedGoal.current_value} / Target: {selectedGoal.target_value}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Add any notes about this progress update"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof URL (optional)
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Proof File (optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSubmitProgress}
                  disabled={submitting || !progressValue}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  onClick={() => {
                    setSelectedGoal(null)
                    setProgressValue('')
                    setProgressNote('')
                    setProofUrl('')
                    setProofFile(null)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
