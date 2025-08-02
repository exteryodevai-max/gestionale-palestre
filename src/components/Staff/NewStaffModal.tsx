import React, { useState } from 'react'
import { X, User, Mail, Phone, Shield, Save, AlertCircle, Info } from 'lucide-react'
import { supabase, UserRole } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface NewStaffModalProps {
  isOpen: boolean
  onClose: () => void
  onStaffCreated: () => void
}

interface StaffFormData {
  nome: string
  cognome: string
  email: string
  telefono: string
  ruolo: UserRole
  attivo: boolean
  data_nascita: string
  indirizzo: string
  note: string
}

export function NewStaffModal({ isOpen, onClose, onStaffCreated }: NewStaffModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<StaffFormData>({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    ruolo: 'staff',
    attivo: true,
    data_nascita: '',
    indirizzo: '',
    note: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Il nome è obbligatorio'
    }

    if (!formData.cognome.trim()) {
      newErrors.cognome = 'Il cognome è obbligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida'
    }

    if (formData.telefono && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.telefono)) {
      newErrors.telefono = 'Numero di telefono non valido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email.trim())
        .single()

      if (existingUser) {
        setErrors({ email: 'Un utente con questa email esiste già' })
        setLoading(false)
        return
      }

      const staffData = {
        nome: formData.nome.trim(),
        cognome: formData.cognome.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim() || null,
        ruolo: formData.ruolo,
        attivo: formData.attivo,
        data_nascita: formData.data_nascita || null,
        indirizzo: formData.indirizzo.trim() || null,
        note: formData.note.trim() || null,
        gym_id: user?.gym_id || null
      }

      const { data, error } = await supabase
        .from('users')
        .insert(staffData)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Nuovo membro staff creato:', data)
      
      // Reset form
      setFormData({
        nome: '',
        cognome: '',
        email: '',
        telefono: '',
        ruolo: 'staff',
        attivo: true,
        data_nascita: '',
        indirizzo: '',
        note: ''
      })
      
      onStaffCreated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore creazione membro staff:', error)
      setErrors({ submit: error.message || 'Errore durante la creazione del membro staff' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof StaffFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      trainer: 'Trainer',
      staff: 'Staff'
    }
    return labels[role]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nuovo Membro Staff</h2>
              <p className="text-sm text-gray-600">Aggiungi un nuovo membro al team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Error generale */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errors.submit}</span>
              </div>
            )}

            {/* Info importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-blue-700 text-sm">
                <p className="font-medium mb-1">Importante:</p>
                <p>Questo creerà solo il profilo del membro staff. Per consentire l'accesso al sistema, sarà necessario creare separatamente l'account di login tramite il pannello di amministrazione di Supabase.</p>
              </div>
            </div>

            {/* Informazioni Personali */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Informazioni Personali
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.nome ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Inserisci il nome"
                  />
                  {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    value={formData.cognome}
                    onChange={(e) => handleInputChange('cognome', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.cognome ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Inserisci il cognome"
                  />
                  {errors.cognome && <p className="text-red-500 text-xs mt-1">{errors.cognome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data di Nascita
                  </label>
                  <input
                    type="date"
                    value={formData.data_nascita}
                    onChange={(e) => handleInputChange('data_nascita', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    value={formData.indirizzo}
                    onChange={(e) => handleInputChange('indirizzo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Via Roma 123, 00100 Roma"
                  />
                </div>
              </div>
            </div>

            {/* Contatti */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-gray-600" />
                Informazioni di Contatto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="email@esempio.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.telefono ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+39 123 456 7890"
                  />
                  {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                </div>
              </div>
            </div>

            {/* Ruolo e Stato */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-gray-600" />
                Ruolo e Permessi
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruolo *
                  </label>
                  <select
                    value={formData.ruolo}
                    onChange={(e) => handleInputChange('ruolo', e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="staff">Staff</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                    {user?.ruolo === 'super_admin' && (
                      <option value="super_admin">Super Admin</option>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Ruolo selezionato: {getRoleLabel(formData.ruolo)}
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="attivo"
                    checked={formData.attivo}
                    onChange={(e) => handleInputChange('attivo', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="attivo" className="ml-2 block text-sm text-gray-900">
                    Account attivo
                  </label>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Note Aggiuntive</h3>
              
              <textarea
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Note, competenze, orari di lavoro, informazioni aggiuntive..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creazione...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Crea Staff</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}