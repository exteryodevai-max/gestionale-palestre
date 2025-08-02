import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Edit2, Trash2, X, AlertCircle, Receipt, User, Calendar, Euro, CreditCard } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { NewMemberSubscriptionModal } from './NewMemberSubscriptionModal'
import { EditMemberSubscriptionModal } from './EditMemberSubscriptionModal'

interface MemberSubscription {
  id: string
  member_id: string
  product_id: string
  data_inizio: string
  data_fine?: string
  crediti_usati: number
  rinnovo_automatico: boolean
  attivo: boolean
  creato_il: string
  member: {
    nome: string
    cognome: string
    email?: string
    stato: string
  }
  product: {
    name: string
    price: number
    duration_unit: string
    duration_value: number
    credits_included?: number
  }
}

export function MemberSubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState<MemberSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<MemberSubscription | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<MemberSubscription | null>(null)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          member:members!inner(
            nome,
            cognome,
            email,
            stato
          ),
          product:subscription_products!inner(
            name,
            price,
            duration_unit,
            duration_value,
            credits_included
          )
        `)
        .order('creato_il', { ascending: false })

      if (error) throw error
      setSubscriptions(data || [])
    } catch (error) {
      console.error('Error fetching member subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscriptionCreated = () => {
    fetchSubscriptions()
  }

  const handleSubscriptionUpdated = () => {
    fetchSubscriptions()
    setSelectedSubscription(null)
  }

  const handleEditClick = (subscription: MemberSubscription) => {
    setSelectedSubscription(subscription)
    setShowEditModal(true)
  }

  const handleDeleteClick = (subscription: MemberSubscription) => {
    setSubscriptionToDelete(subscription)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!subscriptionToDelete) return

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionToDelete.id)

      if (error) throw error

      console.log('✅ Sottoscrizione eliminata:', subscriptionToDelete.member.nome, subscriptionToDelete.member.cognome)
      fetchSubscriptions()
      setShowDeleteConfirm(false)
      setSubscriptionToDelete(null)
    } catch (error: any) {
      console.error('❌ Errore eliminazione sottoscrizione:', error)
    }
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.member.cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && subscription.attivo) ||
      (statusFilter === 'inactive' && !subscription.attivo) ||
      (statusFilter === 'expired' && subscription.data_fine && new Date(subscription.data_fine) < new Date())

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (subscription: MemberSubscription) => {
    if (!subscription.attivo) {
      return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inattivo</span>
    }
    
    if (subscription.data_fine && new Date(subscription.data_fine) < new Date()) {
      return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Scaduto</span>
    }
    
    if (subscription.data_fine && new Date(subscription.data_fine) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">In scadenza</span>
    }
    
    return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Attivo</span>
  }

  const getDurationLabel = (unit: string, value: number) => {
    const labels = {
      days: value === 1 ? 'Giorno' : 'Giorni',
      weeks: value === 1 ? 'Settimana' : 'Settimane', 
      months: value === 1 ? 'Mese' : 'Mesi',
      years: value === 1 ? 'Anno' : 'Anni',
      credits: 'Crediti'
    }
    return `${value} ${labels[unit as keyof typeof labels] || unit}`
  }

  const calculateStats = () => {
    const activeSubscriptions = filteredSubscriptions.filter(s => s.attivo).length
    const totalRevenue = filteredSubscriptions
      .filter(s => s.attivo)
      .reduce((sum, s) => sum + s.product.price, 0)
    const expiringSoon = filteredSubscriptions.filter(s => 
      s.attivo && s.data_fine && 
      new Date(s.data_fine) > new Date() && 
      new Date(s.data_fine) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length

    return { activeSubscriptions, totalRevenue, expiringSoon }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Caricamento sottoscrizioni...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Sottoscrizioni</h1>
          <p className="text-gray-600 mt-1">
            {filteredSubscriptions.length} sottoscrizioni trovate
          </p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuova Sottoscrizione</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sottoscrizioni Attive</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeSubscriptions}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Receipt className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ricavi Attivi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">€{stats.totalRevenue.toFixed(0)}</p>
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
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.expiringSoon}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
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
              placeholder="Cerca per nome iscritto o abbonamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attive</option>
              <option value="inactive">Inattive</option>
              <option value="expired">Scadute</option>
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
                  Iscritto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Abbonamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periodo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crediti
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.member.nome} {subscription.member.cognome}
                        </div>
                        {subscription.member.email && (
                          <div className="text-sm text-gray-500">
                            {subscription.member.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      €{subscription.product.price.toFixed(2)} - {getDurationLabel(subscription.product.duration_unit, subscription.product.duration_value)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div>{new Date(subscription.data_inizio).toLocaleDateString('it-IT')}</div>
                        {subscription.data_fine && (
                          <div className="text-xs text-gray-500">
                            → {new Date(subscription.data_fine).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(subscription)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subscription.product.duration_unit === 'credits' ? (
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-4 h-4 text-orange-400" />
                        <span>{(subscription.product.credits_included || 0) - subscription.crediti_usati}/{subscription.product.credits_included || 0}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEditClick(subscription)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Modifica sottoscrizione"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(subscription)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Elimina sottoscrizione"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna sottoscrizione trovata</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Inizia creando la prima sottoscrizione'
              }
            </p>
          </div>
        )}
      </div>

      {/* New Subscription Modal */}
      <NewMemberSubscriptionModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubscriptionCreated={handleSubscriptionCreated}
      />

      {/* Edit Subscription Modal */}
      <EditMemberSubscriptionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedSubscription(null)
        }}
        onSubscriptionUpdated={handleSubscriptionUpdated}
        subscription={selectedSubscription}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && subscriptionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Conferma Eliminazione</h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setSubscriptionToDelete(null)
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Sei sicuro di voler eliminare la sottoscrizione di:
                    </p>
                    <p className="font-semibold text-gray-900">
                      {subscriptionToDelete.member.nome} {subscriptionToDelete.member.cognome}
                    </p>
                    <p className="text-sm text-gray-600">
                      Abbonamento: {subscriptionToDelete.product.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  ⚠️ Questa azione non può essere annullata. La sottoscrizione verrà eliminata definitivamente.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setSubscriptionToDelete(null)
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}