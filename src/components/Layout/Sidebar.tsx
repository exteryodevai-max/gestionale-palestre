import React from 'react'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Calendar,
  Dumbbell,
  Settings,
  Smartphone,
  Wrench,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  UserCheck,
  Zap,
  Receipt
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  const { user, signOut, isSuperAdmin } = useAuth()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Iscritti', icon: Users },
    { id: 'subscriptions', label: 'Abbonamenti', icon: CreditCard },
    { id: 'member-subscriptions', label: 'Sottoscrizioni', icon: Receipt },
    { id: 'courses', label: 'Corsi', icon: Dumbbell },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'staff', label: 'Staff', icon: UserCheck },
    { id: 'equipment', label: 'Attrezzature', icon: Dumbbell },
    { id: 'nfc', label: 'NFC/QR', icon: Smartphone },
    { id: 'automations', label: 'Automazioni', icon: Zap },
    { id: 'maintenance', label: 'Manutenzioni', icon: Wrench },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
  ]

  // Add super admin only items
  if (isSuperAdmin) {
    menuItems.push({ id: 'settings', label: 'Impostazioni', icon: Settings })
  }

  return (
    <div className={`bg-gray-900 text-white h-screen transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold">GymManager</h1>
              <p className="text-sm text-gray-400">
                {isSuperAdmin ? 'Super Admin' : 'Admin Panel'}
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">
                {user?.nome.charAt(0)}{user?.cognome.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium">{user?.nome} {user?.cognome}</p>
              <p className="text-sm text-gray-400 capitalize">{user?.ruolo.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={signOut}
          className={`w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}