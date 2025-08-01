import React, { useState } from 'react'
import { X, User, Mail, Phone, Calendar, FileText, Camera, Save, AlertCircle } from 'lucide-react'
import { supabase, MemberStatus } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface NewMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onMemberCreated: () => void
}

interface MemberFormData {
  nome: string
  cognome: string
  email: string
  telefono: string
  data_nascita: string
  codice_fiscale: string
  indirizzo: string
  certificato_valido_fino: string
  stato: MemberStatus
  note: string
}

export function NewMemberModal({ isOpen, onClose, onMemberCreated }: NewMemberModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<MemberFormData>({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    data_nascita: '',
    codice_fiscale: '',
    indirizzo: '',
    certificato_valido_fino: '',
    stato: 'attivo',
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

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida'
    }

    if (formData.telefono && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.telefono)) {
      newErrors.telefono = 'Numero di telefono non valido'
    }

    if (formData.codice_fiscale && formData.codice_fiscale.length !== 16) {
      newErrors.codice_fiscale = 'Il codice fiscale deve essere di 16 caratteri'
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
      const memberData = {
        ...formData,
        email: formData.email || null,
        telefono: formData.telefono || null,
        data_nascita: formData.data_nascita || null,
        codice_fiscale: formData.codice_fiscale || null,
        indirizzo: formData.indirizzo || null,
        certificato_valido_fino: formData.certificato_valido_fino || null,
        note: formData.note || null,
        gym_id: user?.gym_id || 'b1ffcc99-8d1c-5fg9-cc7e-7cc0ce491b22',
        creato_da: user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      }

      const { data, error } = await supabase
        .from('members')
        .insert(memberData)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Nuovo iscritto creato:', data)
      
      // Reset form
      setFormData({
        nome: '',
        cognome: '',
        email: '',
        telefono: '',
        data_nascita: '',
        codice_fiscale: '',
        indirizzo: '',
        certificato_valido_fino: '',
        stato: 'attivo',
        note: ''
      })
      
      onMemberCreated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore creazione iscritto:', error)
      setErrors({ submit: error.message || 'Errore durante la creazione dell\'iscritto' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof MemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nuovo Iscritto</h2>
              <p className="text-sm text-gray-600">Aggiungi un nuovo membro alla palestra</p>
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Codice Fiscale
                  </label>
                  <input
                    type="text"
                    value={formData.codice_fiscale}
                    onChange={(e) => handleInputChange('codice_fiscale', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.codice_fiscale ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="RSSMRA80A01H501U"
                    maxLength={16}
                  />
                  {errors.codice_fiscale && <p className="text-red-500 text-xs mt-1">{errors.codice_fiscale}</p>}
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.telefono ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+39 123 456 7890"
                  />
                  {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    value={formData.indirizzo}
                    onChange={(e) => handleInputChange('indirizzo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Via Roma 123, 00100 Roma"
                  />
                </div>
              </div>
            </div>

            {/* Stato e Certificato */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Stato e Certificazioni
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stato Iscrizione
                  </label>
                  <select
                    value={formData.stato}
                    onChange={(e) => handleInputChange('stato', e.target.value as MemberStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="attivo">Attivo</option>
                    <option value="sospeso">Sospeso</option>
                    <option value="scaduto">Scaduto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificato Medico Valido Fino
                  </label>
                  <input
                    type="date"
                    value={formData.certificato_valido_fino}
                    onChange={(e) => handleInputChange('certificato_valido_fino', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Note Aggiuntive
              </h3>
              
              <textarea
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Note, allergie, informazioni mediche, preferenze..."
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
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creazione...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Crea Iscritto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}