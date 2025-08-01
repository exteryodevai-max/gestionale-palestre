import React from 'react'
import { Clock, UserPlus, Calendar, AlertTriangle } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'access' | 'signup' | 'booking' | 'alert'
  title: string
  description: string
  time: string
  user?: string
}

function ActivityIcon({ type }: { type: string }) {
  const icons = {
    access: Clock,
    signup: UserPlus,
    booking: Calendar,
    alert: AlertTriangle
  }
  
  const colors = {
    access: 'text-blue-600 bg-blue-50',
    signup: 'text-green-600 bg-green-50',
    booking: 'text-purple-600 bg-purple-50',
    alert: 'text-orange-600 bg-orange-50'
  }
  
  const Icon = icons[type as keyof typeof icons] || Clock
  const colorClass = colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50'
  
  return (
    <div className={`p-2 rounded-lg ${colorClass}`}>
      <Icon className="w-4 h-4" />
    </div>
  )
}

export function RecentActivity() {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'access',
      title: 'Accesso in palestra',
      description: 'Mario Rossi è entrato nella sala pesi',
      time: '2 minuti fa',
      user: 'Mario Rossi'
    },
    {
      id: '2',
      type: 'signup',
      title: 'Nuovo iscritto',
      description: 'Lucia Verdi ha completato l\'iscrizione',
      time: '15 minuti fa',
      user: 'Lucia Verdi'
    },
    {
      id: '3',
      type: 'booking',
      title: 'Prenotazione corso',
      description: 'Yoga alle 18:00 - 2 posti disponibili',
      time: '30 minuti fa'
    },
    {
      id: '4',
      type: 'alert',
      title: 'Manutenzione richiesta',
      description: 'Tapis roulant #3 necessita controllo',
      time: '1 ora fa'
    },
    {
      id: '5',
      type: 'access',
      title: 'Utilizzo attrezzatura',
      description: 'Giovanni Bianchi ha utilizzato lat machine',
      time: '1 ora fa',
      user: 'Giovanni Bianchi'
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Attività Recenti</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <ActivityIcon type={activity.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            Vedi tutte le attività
          </button>
        </div>
      </div>
    </div>
  )
}