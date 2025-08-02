import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, UserCheck, X, AlertCircle, Shield, Users } from 'lucide-react'
import { supabase, User, UserRole } from '../../lib/supabase'
import { NewStaffModal } from './NewStaffModal'
import { EditStaffModal } from './EditStaffModal'

export function StaffTable() {
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewStaffModal, setShowNewStaffModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('ruolo', ['admin', 'trainer', 'staff', 'super_admin'])
        .order('creato_il', { ascending: false })

      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStaffCreated = () => {
    fetchStaff()
  }

  const handleStaffUpdated = () => {
    fetchStaff()
    setSelectedStaff(null)
  }

  const handleEditClick = (staffMember: User) => {
    setSelectedStaff(staffMember)
    setShowEditModal(true)
  }

  const handleDeleteClick = (staffMember: User) => {
    setStaffToDelete(staffMember)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', staffToDelete.id)

      if (error) throw error

      console.log('✅ Membro staff eliminato:', staffToDelete.nome, staffToDelete.cognome)
      fetchStaff()
      setShowDeleteConfirm(false)
      setStaffToDelete(null)
    } catch (error: any) {
      console.error('❌ Errore eliminazione membro staff:', error)
    }
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || member.ruolo === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && member.attivo) ||
      (statusFilter === 'inactive' && !member.attivo)

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      trainer: 'bg-green-100 text-green-800',
      staff: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      trainer: 'Trainer',
      staff: 'Staff'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Attivo
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        Inattivo
      </span>
    )
  }

  const calculateStats = () => {
    const activeStaff = filteredStaff.filter(s => s.attivo).length
    const totalStaff = filteredStaff.length
    const trainers = filteredStaff.filter(s => s.ruolo === 'trainer').length
    const admins = filteredStaff.filter(s => s.ruolo === 'admin' || s.ruolo === 'super_admin').length

    return { activeStaff, totalStaff, trainers, admins }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Caricamento staff...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Staff</h1>
          <p className="text-gray-600 mt-1">
            {filteredStaff.length} membri dello staff
          </p>
        </div>
        <button 
          onClick={() => setShowNewStaffModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Staff</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Staff Attivo</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeStaff}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totale Staff</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStaff}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trainer</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.trainers}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Amministratori</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.admins}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
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
              placeholder="Cerca per nome, cognome o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tutti i ruoli</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="trainer">Trainer</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
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
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contatti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ultimo Accesso
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
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-indigo-600">
                            {member.nome.charAt(0)}{member.cognome.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.nome} {member.cognome}
                        </div>
                        {member.data_nascita && (
                          <div className="text-sm text-gray-500">
                            {new Date(member.data_nascita).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.email}</div>
                    <div className="text-sm text-gray-500">{member.telefono}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(member.ruolo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(member.attivo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.ultimo_accesso 
                      ? new Date(member.ultimo_accesso).toLocaleDateString('it-IT')
                      : 'Mai'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.creato_il).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEditClick(member)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Modifica staff"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(member)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Elimina staff"
                      >
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

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun membro dello staff trovato</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Inizia aggiungendo il primo membro dello staff'
              }
            </p>
          </div>
        )}
      </div>

      {/* New Staff Modal */}
      <NewStaffModal
        isOpen={showNewStaffModal}
        onClose={() => setShowNewStaffModal(false)}
        onStaffCreated={handleStaffCreated}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedStaff(null)
        }}
        onStaffUpdated={handleStaffUpdated}
        staff={selectedStaff}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && staffToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Conferma Eliminazione</h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setStaffToDelete(null)
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
                      Sei sicuro di voler eliminare il membro dello staff:
                    </p>
                    <p className="font-semibold text-gray-900">
                      {staffToDelete.nome} {staffToDelete.cognome}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ruolo: {staffToDelete.ruolo}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  ⚠️ Questa azione eliminerà solo il profilo dal database. Se questo utente ha un account di accesso, dovrà essere gestito separatamente.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setStaffToDelete(null)
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