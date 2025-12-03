'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { User } from '@/lib/types'

interface TopBarProps {
  profile: User
}

export default function TopBar({ profile }: TopBarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile.role === 'ceo' ? 'CEO Dashboard' : 'Employee Dashboard'}
          </h1>
          <p className="text-gray-600 text-sm">
            {profile.department ? profile.department.name : 'All Departments'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-gray-900">{profile.full_name}</p>
            <p className="text-sm text-gray-600 capitalize">{profile.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
