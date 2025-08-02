import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/Auth/LoginForm'
import { Sidebar } from './components/Layout/Sidebar'
import { Dashboard } from './components/Dashboard/Dashboard'
import { MembersTable } from './components/Members/MembersTable'
import { SubscriptionsTable } from './components/Subscriptions/SubscriptionsTable'
import { MemberSubscriptionsTable } from './components/Subscriptions/MemberSubscriptionsTable'
import { StaffTable } from './components/Staff/StaffTable'
import { AlertTriangle } from 'lucide-react'

function App() {
  const { user, loading } = useAuth()
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
      case 'member-subscriptions':
        return <MemberSubscriptionsTable />
      case 'calendar':
        return <div><h1 className="text-2xl font-bold">Calendario e Prenotazioni</h1><p className="text-gray-600 mt-2">Modulo in sviluppo...</p></div>
      case 'staff':
        return <StaffTable />
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