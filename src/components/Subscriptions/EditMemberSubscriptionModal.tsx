import React, { useState, useEffect } from 'react'
import { X, Receipt, User, Calendar, CreditCard, Save, AlertCircle } from 'lucide-react'
import { supabase, SubscriptionProduct, Member } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

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

interface EditMemberSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscriptionUpdated: () => void
  subscription: MemberSubscription | null
}

interface SubscriptionFormData {
  data_inizio: string
  data_fine: string
  crediti_usati: number
  rinnovo_automatico: boolean
  attivo: boolean
}

export function EditMemberSubscriptionModal({ isOpen, onClose, onSubscriptionUpdated, subscription }: EditMemberSubscriptionModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<SubscriptionFormData>({
    data_inizio: '',
    data_fine: '',
    crediti_usati: 0,
    rinnovo_automatico: false,
    attivo: true
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-populate form when subscription changes
  useEffect(() => {
    if (subscription) {
      setFormData({
        data_inizio: subscription.data_inizio,
        data_fine: subscription.data_fine || '',
        crediti_usati: subscription.crediti_usati,
        rinnovo_automatico: subscription.rinnovo_automatico,
        attivo: subscription.attivo
      })
    }
  }, [subscription])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.data_inizio) {
      newErrors.data_inizio = 'La data di inizio è obbligatoria'
    }

    if (subscription?.product.duration_unit === 'credits') {
      const maxCredits = subscription.product.credits_included || 0
      if (formData.crediti_usati < 0) {
        newErrors.crediti_usati = 'I crediti usati non possono essere negativi'
      }
      if (formData.crediti_usati > maxCredits) {
        newErrors.crediti_usati = `I crediti usati non possono superare ${maxCredits}`
      }
    }

    if (formData.data_fine && formData.data_inizio && new Date(formData.data_fine) <= new Date(formData.data_inizio)) {
      newErrors.data_fine = 'La data di fine deve essere successiva alla data di inizio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subscription || !validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const subscriptionData = {
        data_inizio: formData.data_inizio,
        data_fine: formData.data_fine || null,
        crediti_usati: formData.crediti_usati,
        rinnovo_automatico: formData.rinnovo_automatico,
        attivo: formData.attivo
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', subscription.id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Sottoscrizione aggiornata:', data)
      
      onSubscriptionUpdated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore aggiornamento sottoscrizione:', error)
      setErrors({ submit: error.message || 'Errore durante l\'aggiornamento della sottoscrizione' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof SubscriptionFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const calculateRemainingCredits = () => {
    if (!subscription || subscription.product.duration_unit !== 'credits') return null
    const total = subscription.product.credits_included || 0
    const used = formData.crediti_usati
    return total - used
  }

  if (!isOpen || !subscription) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Modifica Sottoscrizione</h2>
              <p className="text-sm text-gray-600">
                {subscription.member.nome} {subscription.member.cognome} - {subscription.product.name}
              </p>
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

            {/* Informazioni Iscritto e Abbonamento (Read-only) */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Dettagli Sottoscrizione
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Iscritto</label>
                  <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                    {subscription.member.nome} {subscription.member.cognome}
                    {subscription.member.email && (
                      <span className="text-gray-500 block">{subscription.member.email}</span>
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abbonamento</label>
                  <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                    {subscription.product.name}
                    <span className="text-gray-500 block">€{subscription.product.price.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Periodo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inizio *
                  </label>
                  <input
                    type="date"
                    value={formData.data_inizio}
                    onChange={(e) => handleInputChange('data_inizio', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.data_inizio ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.data_inizio && <p className="text-red-500 text-xs mt-1">{errors.data_inizio}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fine {subscription.product.duration_unit === 'credits' ? '(Opzionale)' : ''}
                  </label>
                  <input
                    type="date"
                    value={formData.data_fine}
                    onChange={(e) => handleInputChange('data_fine', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.data_fine ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.data_fine && <p className="text-red-500 text-xs mt-1">{errors.data_fine}</p>}
                </div>
              </div>
            </div>

            {/* Crediti (solo per abbonamenti a crediti) */}
            {subscription.product.duration_unit === 'credits' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                  Gestione Crediti
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Crediti Usati
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={subscription.product.credits_included || 0}
                      value={formData.crediti_usati}
                      onChange={(e) => handleInputChange('crediti_usati', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.crediti_usati ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.crediti_usati && <p className="text-red-500 text-xs mt-1">{errors.crediti_usati}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Crediti Rimanenti
                    </label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                      {calculateRemainingCredits()} / {subscription.product.credits_included || 0}
                    </div>
                  </div>
                </div>

                {/* Progress bar crediti */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Utilizzo crediti</span>
                    <span>{Math.round((formData.crediti_usati / (subscription.product.credits_included || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((formData.crediti_usati / (subscription.product.credits_included || 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Impostazioni */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Impostazioni</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rinnovo_automatico"
                    checked={formData.rinnovo_automatico}
                    onChange={(e) => handleInputChange('rinnovo_automatico', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rinnovo_automatico" className="ml-2 block text-sm text-gray-900">
                    Rinnovo automatico
                  </label>
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
                    Sottoscrizione attiva
                  </label>
                </div>
              </div>
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