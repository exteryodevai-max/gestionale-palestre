import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/Auth/LoginForm'
import { Sidebar } from './components/Layout/Sidebar'
import { Dashboard } from './components/Dashboard/Dashboard'
import { MembersTable } from './components/Members/MembersTable'
import { SubscriptionsTable } from './components/Subscriptions/SubscriptionsTable'
import { AlertTriangle } from 'lucide-react'

function App() {
  const { user, loading, isDemo } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />
      case 'members':
        return <MembersTable />
      case 'subscriptions':
        return <SubscriptionsTable />
      case 'calendar':
        return <div><h1 className="text-2xl font-bold">Calendario e Prenotazioni</h1><p className="text-gray-600 mt-2">Modulo in sviluppo...</p></div>
      case 'staff':
        return <div><h1 className="text-2xl font-bold">Gestione Staff</h1><p className="text-gray-600 mt-2">Modulo in sviluppo...</p></div>
      case 'equipment':
        return <div><h1 className="text-2xl font-bold">Gestione Attrezzature</h1><p className="text-gray-600 mt-2">Modulo in sviluppo...</p></div>
      case 'nfc':
        return <div><h1 className="text-2xl font-bold">Gestione NFC/QR</h1><p className="text-gray-600 mt-2">Modulo in sviluppo...</p></div>
      case 'automations':
        return <div><h1 className="text-2xl font-bold">Automazioni</h1><p className="text-gray-600 mt-2">Modulo in sviluppo...</p></div>
      case 'maintenance':
        return <div><h1 className="text-2xl font-bold">Manutenzioni</h1><p className="text-gray-600 mt-2">Modulo in sviluppo...</p></div>
      case 'reports':
        return <div><h1 className="text-2xl font-bold">Reports e Statistiche</h1><p className="text-gray-600 mt-2">Modulo in sviluppo...</p></div>
      case 'notifications':
        return <div><h1 className="text-2xl font-bold">Centro Notifiche</h1><p className="text-gray-600 mt-2">Modulo in sviluppo...</p></div>
      case 'settings':
        return <div><h1 className="text-2xl font-bold">Impostazioni Sistema</h1><p className="text-gray-600 mt-2">Modulo in sviluppo...</p></div>
      default:
        return <Dashboard onNavigate={setActiveTab} />
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="flex h-screen bg-gray-100 flex-col">
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200 py-2 px-4">
          <div className="container mx-auto flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-amber-800">
              <span className="font-medium">Modalità Demo:</span> L'applicazione è in esecuzione con dati fittizi. Per utilizzare un database reale, configura le variabili Supabase nel file .env
            </p>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App