import React from 'react'
import { Users, Calendar, CreditCard, Activity } from 'lucide-react'
import { useDashboardStats } from '../../hooks/useDashboardStats'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<any>
}

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon }: StatCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }[changeType]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${changeColor}`}>
              {change}
            </p>
          )}
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  )
}

export function DashboardStats() {
  const { stats, loading } = useDashboardStats()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="bg-gray-200 p-3 rounded-lg w-12 h-12"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statsConfig = [
    {
      title: 'Anagrafiche Attive',
      value: stats.activeMembers,
      change: stats.membersChange,
      changeType: stats.membersChangeType,
      icon: Users
    },
    {
      title: 'Ingressi Oggi',
      value: stats.todayAccess,
      change: stats.accessChange,
      changeType: stats.accessChangeType,
      icon: Activity
    },
    {
      title: 'Prenotazioni',
      value: stats.todayBookings,
      change: 'Oggi',
      changeType: 'neutral' as const,
      icon: Calendar
    },
    {
      title: 'Ricavi Mensili',
      value: `€${stats.monthlyRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      changeType: stats.revenueChangeType,
      icon: CreditCard
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}