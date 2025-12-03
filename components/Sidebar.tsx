'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@/lib/types'

interface SidebarProps {
  profile: User
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const isCEO = profile.role === 'ceo'

  const ceoLinks = [
    { href: '/dashboard/ceo', label: 'Overview', icon: '📊' },
    { href: '/dashboard/goals/new', label: 'Create Goal', icon: '➕' },
  ]

  const employeeLinks = [
    { href: '/dashboard/employee', label: 'My Dashboard', icon: '📈' },
  ]

  const links = isCEO ? ceoLinks : employeeLinks

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">{isCEO ? 'CEO View' : 'Employee View'}</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="border-t border-gray-700 pt-6">
          <p className="text-gray-400 text-xs mb-2">Signed in as</p>
          <p className="font-medium text-sm">{profile.full_name}</p>
          <p className="text-gray-500 text-xs capitalize">{profile.role}</p>
          {profile.department && (
            <p className="text-gray-500 text-xs mt-1">{profile.department.name}</p>
          )}
        </div>
      </div>
    </aside>
  )
}
