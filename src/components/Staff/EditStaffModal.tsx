import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Shield, Save, AlertCircle, Info, GraduationCap, DollarSign, FileText, Briefcase, Plus } from 'lucide-react'
import { supabase, UserRole } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface EditStaffModalProps {
  isOpen: boolean
  onClose: () => void
  onStaffUpdated: () => void
  staff: any | null
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
  // Nuovi campi staff
  titolo_studio: string
  diploma_brevetti: string
  paga_oraria: number
  modalita_pagamento: string
  partita_iva: string
  tipo_contratto: string
  note_contrattuali: string
}

export function EditStaffModal({ isOpen, onClose, onStaffUpdated, staff }: EditStaffModalProps) {
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
    note: '',
    // Nuovi campi staff
    titolo_studio: '',
    diploma_brevetti: '',
    paga_oraria: 0,
    modalita_pagamento: 'oraria',
    partita_iva: '',
    tipo_contratto: '',
    note_contrattuali: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [certificazioni, setCertificazioni] = useState<any[]>([])

  // Pre-populate form when staff changes
  useEffect(() => {
    if (staff) {
      setFormData({
        nome: staff.nome || '',
        cognome: staff.cognome || '',
        email: staff.email || '',
        telefono: staff.telefono || '',
        ruolo: staff.ruolo || 'staff',
        attivo: staff.attivo ?? true,
        data_nascita: staff.data_nascita || '',
        indirizzo: staff.indirizzo || '',
        note: staff.note || '',
        // Pre-popola nuovi campi staff
        titolo_studio: staff.titolo_studio || '',
        diploma_brevetti: staff.diploma_brevetti || '',
        paga_oraria: staff.paga_oraria || 0,
        modalita_pagamento: staff.modalita_pagamento || 'oraria',
        partita_iva: staff.partita_iva || '',
        tipo_contratto: staff.tipo_contratto || '',
        note_contrattuali: staff.note_contrattuali || ''
      })
    }
  }, [staff])

  const addCertification = () => {
    setCertificazioni(prev => [...prev, {
      nome_certificazione: '',
      data_scadenza: '',
      data_rilascio: '',
      ente_rilascio: '',
      numero_certificato: '',
      note: ''
    }])
  }

  const removeCertification = (index: number) => {
    setCertificazioni(prev => prev.map((cert, i) => 
      i === index ? { ...cert, toDelete: true } : cert
    ))
  }

  const updateCertification = (index: number, field: string, value: string) => {
    setCertificazioni(prev => prev.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    ))
  }

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
    
    if (!staff || !validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Check if email already exists (excluding current user)
      if (formData.email !== staff.email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email.trim())
          .neq('id', staff.id)
          .maybeSingle()

        if (existingUser !== null) {
          setErrors({ email: 'Un utente con questa email esiste già' })
          setLoading(false)
          return
        }
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
        aggiornato_il: new Date().toISOString(),
        // Nuovi campi staff
        titolo_studio: formData.titolo_studio.trim() || null,
        diploma_brevetti: formData.diploma_brevetti.trim() || null,
        paga_oraria: formData.paga_oraria || null,
        modalita_pagamento: formData.modalita_pagamento,
        partita_iva: formData.partita_iva.trim() || null,
        tipo_contratto: formData.tipo_contratto.trim() || null,
        note_contrattuali: formData.note_contrattuali.trim() || null
      }

      const { data, error } = await supabase
        .from('users')
        .update(staffData)
        .eq('id', staff.id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Membro staff aggiornato:', data)
      
      onStaffUpdated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore aggiornamento membro staff:', error)
      setErrors({ submit: error.message || 'Errore durante l\'aggiornamento del membro staff' })
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

  if (!isOpen || !staff) return null

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
              <h2 className="text-xl font-bold text-gray-900">Modifica Staff</h2>
              <p className="text-sm text-gray-600">Aggiorna i dati di {staff.nome} {staff.cognome}</p>
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
                <p>Questa modifica aggiorna solo il profilo del membro staff. Le modifiche all'email o alla password di accesso devono essere gestite separatamente nel pannello di amministrazione di Supabase.</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="attivo" className="ml-2 block text-sm text-gray-900">
                    Account attivo
                  </label>
                </div>
              </div>
            </div>

            {/* Formazione e Qualifiche */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-gray-600" />
                Formazione e Qualifiche
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo di Studio
                  </label>
                  <input
                    type="text"
                    value={formData.titolo_studio}
                    onChange={(e) => handleInputChange('titolo_studio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="es. Laurea in Scienze Motorie, Diploma ISEF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diplomi e Brevetti
                  </label>
                  <textarea
                    value={formData.diploma_brevetti}
                    onChange={(e) => handleInputChange('diploma_brevetti', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="es. Istruttore Fitness, Personal Trainer, Brevetto Nuoto, Certificazione Yoga..."
                  />
                </div>
              </div>
            </div>

            {/* Certificazioni Specifiche */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-gray-600" />
                  Certificazioni con Scadenza
                </h3>
                <button
                  type="button"
                  onClick={addCertification}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi</span>
                </button>
              </div>
              
              {certificazioni.filter(c => !c.toDelete).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nessuna certificazione presente</p>
                  <p className="text-xs">Clicca "Aggiungi" per inserire brevetti con scadenze specifiche</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificazioni
                    .filter(cert => !cert.toDelete)
                    .map((cert, index) => (
                    <div key={cert.id || index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {cert.nome_certificazione || `Certificazione #${index + 1}`}
                          {cert.data_scadenza && new Date(cert.data_scadenza) < new Date() && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Scaduta</span>
                          )}
                          {cert.data_scadenza && new Date(cert.data_scadenza) > new Date() && new Date(cert.data_scadenza) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">In scadenza</span>
                          )}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Nome Certificazione *
                          </label>
                          <input
                            type="text"
                            value={cert.nome_certificazione}
                            onChange={(e) => updateCertification(index, 'nome_certificazione', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="es. Brevetto BLSD"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Data Scadenza *
                          </label>
                          <input
                            type="date"
                            value={cert.data_scadenza}
                            onChange={(e) => updateCertification(index, 'data_scadenza', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Data Rilascio
                          </label>
                          <input
                            type="date"
                            value={cert.data_rilascio}
                            onChange={(e) => updateCertification(index, 'data_rilascio', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Ente Rilascio
                          </label>
                          <input
                            type="text"
                            value={cert.ente_rilascio}
                            onChange={(e) => updateCertification(index, 'ente_rilascio', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="es. FIN, CONI, ASI"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Numero Certificato
                          </label>
                          <input
                            type="text"
                            value={cert.numero_certificato}
                            onChange={(e) => updateCertification(index, 'numero_certificato', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="es. ABC123456"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Note
                          </label>
                          <input
                            type="text"
                            value={cert.note}
                            onChange={(e) => updateCertification(index, 'note', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Note aggiuntive..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informazioni Contrattuali */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-gray-600" />
                Informazioni Contrattuali
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo Contratto
                  </label>
                  <select
                    value={formData.tipo_contratto}
                    onChange={(e) => handleInputChange('tipo_contratto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleziona tipo contratto...</option>
                    <option value="dipendente">Dipendente</option>
                    <option value="collaboratore">Collaboratore</option>
                    <option value="freelance">Freelance</option>
                    <option value="stagista">Stagista</option>
                    <option value="volontario">Volontario</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partita IVA
                  </label>
                  <input
                    type="text"
                    value={formData.partita_iva}
                    onChange={(e) => handleInputChange('partita_iva', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345678901"
                    maxLength={11}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Contrattuali
                </label>
                <textarea
                  value={formData.note_contrattuali}
                  onChange={(e) => handleInputChange('note_contrattuali', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Condizioni particolari, benefit, orari di lavoro, clausole speciali..."
                />
              </div>
            </div>

            {/* Informazioni Economiche */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-gray-600" />
                Informazioni Economiche
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modalità di Pagamento
                  </label>
                  <select
                    value={formData.modalita_pagamento}
                    onChange={(e) => handleInputChange('modalita_pagamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="oraria">Paga Oraria</option>
                    <option value="mensile">Stipendio Mensile</option>
                    <option value="percentuale">Percentuale su Corsi</option>
                    <option value="forfait">Forfait</option>
                    <option value="mista">Modalità Mista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.modalita_pagamento === 'oraria' ? 'Paga Oraria (€/h)' :
                     formData.modalita_pagamento === 'mensile' ? 'Stipendio Mensile (€)' :
                     formData.modalita_pagamento === 'percentuale' ? 'Percentuale (%)' :
                     formData.modalita_pagamento === 'forfait' ? 'Forfait (€)' :
                     'Importo Base (€)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={formData.modalita_pagamento === 'percentuale' ? '0.1' : '0.01'}
                    value={formData.paga_oraria}
                    onChange={(e) => handleInputChange('paga_oraria', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.modalita_pagamento === 'percentuale' ? '15.0' : '0.00'}
                  />
                </div>
              </div>
            </div>

            {/* Note Generali */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Note Generali
              </h3>
              
              <textarea
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Note generali, competenze aggiuntive, informazioni varie..."
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
                  <span>Aggiornamento...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salva Modifiche</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}