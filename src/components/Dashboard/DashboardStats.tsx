import React from 'react'
import { Users, Calendar, CreditCard, Activity } from 'lucide-react'

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
  const stats = [
    {
      title: 'Iscritti Attivi',
      value: '1,248',
      change: '+12% vs mese scorso',
      changeType: 'positive' as const,
      icon: Users
    },
    {
      title: 'Ingressi Oggi',
      value: '184',
      change: '+5% vs ieri',
      changeType: 'positive' as const,
      icon: Activity
    },
    {
      title: 'Prenotazioni',
      value: '32',
      change: 'Oggi',
      changeType: 'neutral' as const,
      icon: Calendar
    },
    {
      title: 'Ricavi Mensili',
      value: '€24,500',
      change: '+8% vs mese scorso',
      changeType: 'positive' as const,
      icon: CreditCard
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}