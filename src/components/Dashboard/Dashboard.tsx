import React from 'react'
import { DashboardStats } from './DashboardStats'
import { RecentActivity } from './RecentActivity'
import { QuickActions } from './QuickActions'
import { useAuth } from '../../hooks/useAuth'

interface DashboardProps {
  onNavigate: (tab: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, isSuperAdmin } = useAuth()

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-member':
        onNavigate('members')
        break
      case 'new-booking':
        onNavigate('calendar')
        break
      case 'scan-nfc':
        onNavigate('nfc')
        break
      case 'send-notification':
        onNavigate('notifications')
        break
      case 'maintenance':
        onNavigate('maintenance')
        break
      case 'quick-report':
        onNavigate('reports')
        break
      default:
        console.log('Action:', action)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </h1>
          <p className="text-gray-600 mt-1">
            Benvenuto, {user?.nome}! Ecco un riepilogo della tua palestra
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('it-IT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleTimeString('it-IT', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div>
          <QuickActions onActionClick={handleQuickAction} />
        </div>
      </div>

      {/* Super Admin Only Section */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Pannello Super Admin
          </h3>
          <p className="text-purple-700 mb-4">
            Hai accesso completo a tutti i dati e le impostazioni del sistema.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => onNavigate('settings')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Impostazioni Sistema
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Report Globali
            </button>
          </div>
        </div>
      )}
    </div>
  )
}