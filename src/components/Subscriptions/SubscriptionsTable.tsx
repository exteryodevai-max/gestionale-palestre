import React, { useState, useEffect } from 'react'
import { Search, Filter, MoreHorizontal, Edit2, Trash2, CreditCard, Calendar, Euro, Package, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import { supabase, SubscriptionProduct, DurationUnitType } from '../../lib/supabase'
import { NewSubscriptionProductModal } from './NewSubscriptionProductModal'

export function SubscriptionsTable() {
  const [subscriptionProducts, setSubscriptionProducts] = useState<SubscriptionProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [durationFilter, setDurationFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewSubscriptionProductModal, setShowNewSubscriptionProductModal] = useState(false)

  useEffect(() => {
    fetchSubscriptionProducts()
  }, [])

  const fetchSubscriptionProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setSubscriptionProducts(data || [])
    } catch (error) {
      console.error('Error fetching subscription products:', error)
      setSubscriptionProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleProductCreated = () => {
    fetchSubscriptionProducts()
  }

  const filteredProducts = subscriptionProducts.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDuration = durationFilter === 'all' || product.duration_unit === durationFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active)

    return matchesSearch && matchesDuration && matchesStatus
  })

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Attivo
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Inattivo
      </span>
    )
  }

  const getDurationLabel = (unit: DurationUnitType, value: number) => {
    const labels = {
      days: value === 1 ? 'Giorno' : 'Giorni',
      weeks: value === 1 ? 'Settimana' : 'Settimane', 
      months: value === 1 ? 'Mese' : 'Mesi',
      years: value === 1 ? 'Anno' : 'Anni',
      credits: 'Crediti'
    }
    return `${value} ${labels[unit]}`
  }

  const getDurationColor = (unit: DurationUnitType) => {
    const colors = {
      days: 'bg-green-100 text-green-800',
      weeks: 'bg-blue-100 text-blue-800',
      months: 'bg-purple-100 text-purple-800',
      years: 'bg-indigo-100 text-indigo-800',
      credits: 'bg-orange-100 text-orange-800'
    }
    return colors[unit]
  }

  const calculateStats = () => {
    const activeProducts = filteredProducts.filter(p => p.is_active).length
    const totalProducts = filteredProducts.length
    const averagePrice = filteredProducts.length > 0 
      ? filteredProducts.reduce((sum, p) => sum + p.price, 0) / filteredProducts.length 
      : 0
    const creditProducts = filteredProducts.filter(p => p.duration_unit === 'credits').length

    return { activeProducts, totalProducts, averagePrice, creditProducts }
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
            {filteredProducts.length} abbonamenti trovati
          </p>
        </div>
        <button 
          onClick={() => setShowNewSubscriptionProductModal(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Abbonamento</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abbonamenti Attivi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeProducts}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prezzo Medio</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">€{stats.averagePrice.toFixed(0)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Euro className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totale Abbonamenti</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abbonamenti a Crediti</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.creditProducts}</p>
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
              placeholder="Cerca per nome o descrizione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Duration Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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
              className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attivi</option>
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
                  Abbonamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durata
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prezzo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crediti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creato
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-sm text-gray-500">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDurationColor(product.duration_unit)}`}>
                      {getDurationLabel(product.duration_unit, product.duration_value)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Euro className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{product.price.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.duration_unit === 'credits' && product.credits_included ? (
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-4 h-4 text-orange-400" />
                        <span className="font-medium">{product.credits_included}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.is_active)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.created_at).toLocaleDateString('it-IT')}
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
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
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

      {/* New Subscription Product Modal */}
      <NewSubscriptionProductModal
        isOpen={showNewSubscriptionProductModal}
        onClose={() => setShowNewSubscriptionProductModal(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  )
}