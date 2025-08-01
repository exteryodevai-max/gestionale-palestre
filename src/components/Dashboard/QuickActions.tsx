import React from 'react'
import { UserPlus, Calendar, QrCode, Bell, Wrench, BarChart3 } from 'lucide-react'

interface QuickActionProps {
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  onClick: () => void
}

function QuickAction({ title, description, icon: Icon, color, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-${color}-300 hover:bg-${color}-50 transition-all duration-200 text-left group`}
    >
      <div className={`inline-flex p-2 rounded-lg bg-${color}-100 text-${color}-600 mb-3 group-hover:bg-${color}-200`}>
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  )
}

interface QuickActionsProps {
  onActionClick: (action: string) => void
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const actions = [
    {
      title: 'Nuovo Iscritto',
      description: 'Aggiungi un nuovo membro',
      icon: UserPlus,
      color: 'blue',
      action: 'new-member'
    },
    {
      title: 'Prenota Corso',
      description: 'Gestisci prenotazioni',
      icon: Calendar,
      color: 'green',
      action: 'new-booking'
    },
    {
      title: 'Scansiona NFC',
      description: 'Associa tag NFC',
      icon: QrCode,
      color: 'purple',
      action: 'scan-nfc'
    },
    {
      title: 'Invia Notifica',
      description: 'Notifica broadcast',
      icon: Bell,
      color: 'orange',
      action: 'send-notification'
    },
    {
      title: 'Manutenzione',
      description: 'Registra intervento',
      icon: Wrench,
      color: 'red',
      action: 'maintenance'
    },
    {
      title: 'Report Veloce',
      description: 'Genera report',
      icon: BarChart3,
      color: 'indigo',
      action: 'quick-report'
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Azioni Rapide</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              color={action.color}
              onClick={() => onActionClick(action.action)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}