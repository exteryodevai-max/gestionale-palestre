import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, UserCheck, X, AlertCircle } from 'lucide-react'
import { supabase, Member } from '../../lib/supabase'
import { NewMemberModal } from './NewMemberModal'
import { EditMemberModal } from './EditMemberModal'

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewMemberModal, setShowNewMemberModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('creato_il', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMemberCreated = () => {
    fetchMembers() // Ricarica la lista dopo la creazione
  }

  const handleMemberUpdated = () => {
    fetchMembers()
    setSelectedMember(null)
  }

  const handleEditClick = (member: Member) => {
    setSelectedMember(member)
    setShowEditModal(true)
  }

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberToDelete.id)

      if (error) throw error

      console.log('✅ Iscritto eliminato:', memberToDelete.nome, memberToDelete.cognome)
      fetchMembers()
      setShowDeleteConfirm(false)
      setMemberToDelete(null)
    } catch (error: any) {
      console.error('❌ Errore eliminazione iscritto:', error)
      // You could add error handling here with a toast or alert
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || member.stato === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      attivo: 'bg-green-100 text-green-800',
      scaduto: 'bg-red-100 text-red-800',
      sospeso: 'bg-yellow-100 text-yellow-800'
    }
    
    const labels = {
      attivo: 'Attivo',
      scaduto: 'Scaduto',
      sospeso: 'Sospeso'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Caricamento iscritti...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Iscritti</h1>
          <p className="text-gray-600 mt-1">
            {filteredMembers.length} iscritti totali
          </p>
        </div>
        <button 
          onClick={() => setShowNewMemberModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Iscritto</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca per nome, cognome o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tutti gli stati</option>
              <option value="attivo">Attivi</option>
              <option value="scaduto">Scaduti</option>
              <option value="sospeso">Sospesi</option>
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
                  Contatti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Iscrizione
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-gray-500" />
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
                    {getStatusBadge(member.stato)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.certificato_valido_fino ? (
                      <div>
                        <div className="text-sm">
                          {new Date(member.certificato_valido_fino).toLocaleDateString('it-IT')}
                        </div>
                        <div className={`text-xs ${
                          new Date(member.certificato_valido_fino) < new Date()
                            ? 'text-red-600'
                            : new Date(member.certificato_valido_fino) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                          {new Date(member.certificato_valido_fino) < new Date()
                            ? 'Scaduto'
                            : new Date(member.certificato_valido_fino) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            ? 'In scadenza'
                            : 'Valido'
                          }
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Non caricato</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.creato_il).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEditClick(member)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Modifica iscritto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(member)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Elimina iscritto"
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

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun iscritto trovato</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Inizia aggiungendo il primo iscritto'
              }
            </p>
          </div>
        )}
      </div>

      {/* New Member Modal */}
      <NewMemberModal
        isOpen={showNewMemberModal}
        onClose={() => setShowNewMemberModal(false)}
        onMemberCreated={handleMemberCreated}
      />

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedMember(null)
        }}
        onMemberUpdated={handleMemberUpdated}
        member={selectedMember}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && memberToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Conferma Eliminazione</h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setMemberToDelete(null)
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
                      Sei sicuro di voler eliminare l'iscritto:
                    </p>
                    <p className="font-semibold text-gray-900">
                      {memberToDelete.nome} {memberToDelete.cognome}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  ⚠️ Questa azione non può essere annullata. L'iscritto e tutti i suoi dati verranno eliminati definitivamente.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setMemberToDelete(null)
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