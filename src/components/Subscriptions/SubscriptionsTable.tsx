import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, CreditCard, Calendar, Euro, Users, TrendingUp, AlertCircle, Package } from 'lucide-react'
import { supabase, SubscriptionWithMember, DurationUnitType } from '../../lib/supabase'
import { NewSubscriptionModal } from './NewSubscriptionModal'
import { NewSubscriptionProductModal } from './NewSubscriptionProductModal'

export function SubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [durationFilter, setDurationFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewSubscriptionModal, setShowNewSubscriptionModal] = useState(false)
  const [showNewSubscriptionProductModal, setShowNewSubscriptionProductModal] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          member:members(
            nome,
            cognome,
            email,
            stato
          ),
          product:subscription_products(
            name,
            description,
            price,
            duration_value,
            duration_unit,
            credits_included
          )
        `)
        .order('creato_il', { ascending: false })

      if (error) throw error

      // Filter out subscriptions without valid member or product data
      const validSubscriptions = (data || []).filter(
        subscription => subscription.member && subscription.product
      )
      
      setSubscriptions(validSubscriptions)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      // Set empty array on error to prevent UI crashes
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubscriptionCreated = () => {
    fetchSubscriptions() // Ricarica la lista dopo la creazione
  }

  const handleProductCreated = () => {
    // Potresti voler ricaricare anche i prodotti se necessario
    console.log('Nuovo prodotto abbonamento creato')
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const memberName = `${subscription.member.nome} ${subscription.member.cognome}`.toLowerCase()
    const matchesSearch = 
      memberName.includes(searchTerm.toLowerCase()) ||
      subscription.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.member.email?.toLowerCase().includes(searchTerm.toLowerCase()) // Keep this line

    const matchesDuration = durationFilter === 'all' || subscription.product.duration_unit === durationFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && subscription.attivo) ||
      (statusFilter === 'inactive' && !subscription.attivo) ||
      (statusFilter === 'expired' && subscription.data_fine && new Date(subscription.data_fine) < new Date()) ||
      (statusFilter === 'expiring' && subscription.data_fine && 
        new Date(subscription.data_fine) > new Date() && 
        new Date(subscription.data_fine) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

    return matchesSearch && matchesDuration && matchesStatus
  })

  const getSubscriptionStatus = (subscription: SubscriptionWithMember) => {
    if (!subscription.attivo) {
      return { label: 'Inattivo', color: 'bg-gray-100 text-gray-800' }
    } // Keep this line

    if (subscription.data_fine) {
      const endDate = new Date(subscription.data_fine)
      const now = new Date()
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      if (endDate < now) {
        return { label: 'Scaduto', color: 'bg-red-100 text-red-800' }
      } else if (endDate < thirtyDaysFromNow) {
        return { label: 'In scadenza', color: 'bg-yellow-100 text-yellow-800' }
      }
    }
    
    return { label: 'Attivo', color: 'bg-green-100 text-green-800' } // Keep this line
  }

  const getDurationLabel = (unit: DurationUnitType, value: number) => {
    const labels = {
      days: value === 1 ? 'Giorno' : 'Giorni',
      weeks: value === 1 ? 'Settimana' : 'Settimane', 
      months: value === 1 ? 'Mese' : 'Mesi',
      years: value === 1 ? 'Anno' : 'Anni',
      credits: 'Crediti'
    } // Keep this line
    return `${value} ${labels[unit]}`
  }

  const getDurationColor = (unit: DurationUnitType) => {
    const colors = {
      days: 'bg-green-100 text-green-800',
      weeks: 'bg-blue-100 text-blue-800',
      months: 'bg-purple-100 text-purple-800',
      years: 'bg-indigo-100 text-indigo-800',
      credits: 'bg-orange-100 text-orange-800'
    } // Keep this line
    return colors[unit]
  }

  const calculateStats = () => {
    const active = filteredSubscriptions.filter(s => s.attivo).length
    const totalRevenue = filteredSubscriptions
      .filter(s => s.attivo && s.product.price)
      .reduce((sum, s) => sum + (s.product.price || 0), 0)
    const expiring = filteredSubscriptions.filter(s => {
      if (!s.data_fine || !s.attivo) return false
      const endDate = new Date(s.data_fine)
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      return endDate < thirtyDaysFromNow && endDate > new Date()
    }).length
    const creditsUsed = filteredSubscriptions
      .filter(s => s.product.duration_unit === 'credits' && s.crediti_usati !== undefined)
      .reduce((sum, s) => sum + s.crediti_usati, 0)

    return { active, totalRevenue, expiring, creditsUsed }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Caricamento abbonamenti...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Abbonamenti</h1>
          <p className="text-gray-600 mt-1">
            {filteredSubscriptions.length} abbonamenti trovati
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowNewSubscriptionProductModal(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Nuovo Prodotto</span>
          </button>
          <button 
            onClick={() => setShowNewSubscriptionModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Abbonamento</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abbonamenti Attivi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ricavi Mensili</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">€{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Euro className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Scadenza</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.expiring}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Crediti Utilizzati</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.creditsUsed}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca per nome membro o abbonamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tutte le durate</option>
              <option value="days">Giorni</option>
              <option value="weeks">Settimane</option>
              <option value="months">Mesi</option>
              <option value="years">Anni</option>
              <option value="credits">Crediti</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attivi</option>
              <option value="expiring">In scadenza</option>
              <option value="expired">Scaduti</option>
              <option value="inactive">Inattivi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Abbonamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periodo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crediti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prezzo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => {
                const status = getSubscriptionStatus(subscription)
                const remainingCredits = (subscription.product.credits_included || 0) - subscription.crediti_usati
                
                return (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {subscription.member.nome.charAt(0)}{subscription.member.cognome.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.member.nome} {subscription.member.cognome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.product.name}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDurationColor(subscription.product.duration_unit)}`}>
                        {getDurationLabel(subscription.product.duration_unit, subscription.product.duration_value)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(subscription.data_inizio).toLocaleDateString('it-IT')}</span>
                      </div>
                      {subscription.data_fine && (
                        <div className="text-xs text-gray-500 mt-1">
                          fino al {new Date(subscription.data_fine).toLocaleDateString('it-IT')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.product.duration_unit === 'credits' ? (
                        <div>
                          <div className="font-medium">{remainingCredits}/{subscription.product.credits_included || 0}</div>
                          <div className="text-xs text-gray-500">
                            {subscription.crediti_usati} utilizzati
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.product.price ? (
                        <div className="flex items-center space-x-1"> // Keep this line
                          <Euro className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{subscription.product.price}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                        {subscription.rinnovo_automatico && (
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">Auto-rinnovo</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun abbonamento trovato</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || durationFilter !== 'all' || statusFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Inizia creando il primo abbonamento'
              }
            </p>
          </div>
        )}
      </div>

      {/* New Subscription Modal */}
      <NewSubscriptionModal
        isOpen={showNewSubscriptionModal}
        onClose={() => setShowNewSubscriptionModal(false)}
        onSubscriptionCreated={handleSubscriptionCreated}
      />

      {/* New Subscription Product Modal */}
      <NewSubscriptionProductModal
        isOpen={showNewSubscriptionProductModal}
        onClose={() => setShowNewSubscriptionProductModal(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  )
}