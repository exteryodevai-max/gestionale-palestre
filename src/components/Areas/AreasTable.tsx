import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, Edit2, Trash2, MapPin, X, AlertCircle, Users, Image } from 'lucide-react'
import { supabase, Area } from '../../lib/supabase'
import { NewAreaModal } from './NewAreaModal'
import { EditAreaModal } from './EditAreaModal'

export function AreasTable() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewAreaModal, setShowNewAreaModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null)

  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setAreas(data || [])
    } catch (error) {
      console.error('Error fetching areas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAreaCreated = () => {
    fetchAreas()
  }

  const handleAreaUpdated = () => {
    fetchAreas()
    setSelectedArea(null)
  }

  const handleEditClick = (area: Area) => {
    setSelectedArea(area)
    setShowEditModal(true)
  }

  const handleDeleteClick = (area: Area) => {
    setAreaToDelete(area)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!areaToDelete) return

    try {
      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', areaToDelete.id)

      if (error) throw error

      console.log('✅ Area eliminata:', areaToDelete.nome)
      fetchAreas()
      setShowDeleteConfirm(false)
      setAreaToDelete(null)
    } catch (error: any) {
      console.error('❌ Errore eliminazione area:', error)
      // You could add error handling here with a toast or alert
    }
  }

  const filteredAreas = areas.filter(area => {
    const matchesSearch = 
      area.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.descrizione?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && area.attiva) ||
      (statusFilter === 'inactive' && !area.attiva)

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Attiva
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Inattiva
      </span>
    )
  }

  const calculateStats = () => {
    const activeAreas = filteredAreas.filter(a => a.attiva).length
    const totalAreas = filteredAreas.length
    const totalCapacity = filteredAreas.reduce((sum, a) => sum + a.capacita_max, 0)

    return { activeAreas, totalAreas, totalCapacity }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Caricamento aree...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Aree</h1>
          <p className="text-gray-600 mt-1">
            {filteredAreas.length} aree trovate
          </p>
        </div>
        <button 
          onClick={() => setShowNewAreaModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuova Area</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aree Attive</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeAreas}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totale Aree</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAreas}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Capacità Totale</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCapacity}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attive</option>
              <option value="inactive">Inattive</option>
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
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrizione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacità Max
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
              {filteredAreas.map((area) => (
                <tr key={area.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {area.immagine_url ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={area.immagine_url} alt={area.nome} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {area.nome}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {area.descrizione || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {area.capacita_max}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(area.attiva)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(area.creato_il).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEditClick(area)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Modifica area"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(area)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Elimina area"
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

        {filteredAreas.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna area trovata</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Inizia creando la prima area'
              }
            </p>
          </div>
        )}
      </div>

      {/* New Area Modal */}
      <NewAreaModal
        isOpen={showNewAreaModal}
        onClose={() => setShowNewAreaModal(false)}
        onAreaCreated={handleAreaCreated}
      />

      {/* Edit Area Modal */}
      <EditAreaModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedArea(null)
        }}
        onAreaUpdated={handleAreaUpdated}
        area={selectedArea}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && areaToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Conferma Eliminazione</h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setAreaToDelete(null)
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
                      Sei sicuro di voler eliminare l'area:
                    </p>
                    <p className="font-semibold text-gray-900">
                      {areaToDelete.nome}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  ⚠️ Questa azione non può essere annullata. L'area verrà eliminata definitivamente.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setAreaToDelete(null)
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