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
  // Mappa dei colori per le classi Tailwind
  const colorClasses = {
    blue: {
      border: 'hover:border-blue-300',
      bg: 'hover:bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      iconHover: 'group-hover:bg-blue-200'
    },
    green: {
      border: 'hover:border-green-300',
      bg: 'hover:bg-green-50',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      iconHover: 'group-hover:bg-green-200'
    },
    purple: {
      border: 'hover:border-purple-300',
      bg: 'hover:bg-purple-50',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      iconHover: 'group-hover:bg-purple-200'
    },
    orange: {
      border: 'hover:border-orange-300',
      bg: 'hover:bg-orange-50',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-600',
      iconHover: 'group-hover:bg-orange-200'
    },
    red: {
      border: 'hover:border-red-300',
      bg: 'hover:bg-red-50',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      iconHover: 'group-hover:bg-red-200'
    },
    indigo: {
      border: 'hover:border-indigo-300',
      bg: 'hover:bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
      iconHover: 'group-hover:bg-indigo-200'
    }
  };
  
  // Ottieni le classi per il colore specificato o usa il blu come fallback
  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 border-dashed border-gray-200 ${classes.border} ${classes.bg} transition-all duration-200 text-left group`}
    >
      <div className={`inline-flex p-2 rounded-lg ${classes.iconBg} ${classes.iconText} mb-3 ${classes.iconHover}`}>
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
      title: 'Nuova Anagrafica',
      description: 'Aggiungi una nuova anagrafica',
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