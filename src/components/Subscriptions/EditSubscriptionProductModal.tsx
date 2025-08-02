import React, { useState, useEffect } from 'react'
import { X, Package, Euro, Calendar, Hash, Save, AlertCircle } from 'lucide-react'
import { supabase, DurationUnitType, SubscriptionProduct } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface EditSubscriptionProductModalProps {
  isOpen: boolean
  onClose: () => void
  onProductUpdated: () => void
  product: SubscriptionProduct | null
}

interface ProductFormData {
  name: string
  description: string
  price: number
  duration_value: number
  duration_unit: DurationUnitType
  credits_included: number
  is_active: boolean
}

export function EditSubscriptionProductModal({ isOpen, onClose, onProductUpdated, product }: EditSubscriptionProductModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    duration_value: 1,
    duration_unit: 'months',
    credits_included: 0,
    is_active: true
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-populate form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        duration_value: product.duration_value,
        duration_unit: product.duration_unit,
        credits_included: product.credits_included || 0,
        is_active: product.is_active
      })
    }
  }, [product])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome del prodotto è obbligatorio'
    }

    if (formData.price < 0) {
      newErrors.price = 'Il prezzo non può essere negativo'
    }

    if (formData.duration_value <= 0) {
      newErrors.duration_value = 'La durata deve essere maggiore di 0'
    }

    if (formData.duration_unit === 'credits' && formData.credits_included <= 0) {
      newErrors.credits_included = 'I crediti inclusi devono essere maggiori di 0 per abbonamenti a crediti'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!product || !validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: formData.price,
        duration_value: formData.duration_value,
        duration_unit: formData.duration_unit,
        credits_included: formData.duration_unit === 'credits' ? formData.credits_included : null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('subscription_products')
        .update(productData)
        .eq('id', product.id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Prodotto abbonamento aggiornato:', data)
      
      onProductUpdated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore aggiornamento prodotto abbonamento:', error)
      setErrors({ submit: error.message || 'Errore durante l\'aggiornamento del prodotto abbonamento' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getDurationUnitLabel = (unit: DurationUnitType) => {
    const labels = {
      days: 'Giorni',
      weeks: 'Settimane',
      months: 'Mesi',
      years: 'Anni',
      credits: 'Crediti'
    }
    return labels[unit]
  }

  const getDurationPreview = () => {
    if (formData.duration_unit === 'credits') {
      return `${formData.credits_included} crediti inclusi`
    }
    return `${formData.duration_value} ${getDurationUnitLabel(formData.duration_unit).toLowerCase()}`
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Modifica Abbonamento</h2>
              <p className="text-sm text-gray-600">Aggiorna i dettagli dell'abbonamento</p>
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

            {/* Informazioni Base */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-gray-600" />
                Informazioni Base
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Abbonamento *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="es. Abbonamento Mensile, Ingresso Giornaliero, Pacchetto 10 Lezioni"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrizione opzionale dell'abbonamento..."
                  />
                </div>
              </div>
            </div>

            {/* Prezzo */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Euro className="w-5 h-5 mr-2 text-gray-600" />
                Prezzo
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prezzo (€) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>

            {/* Durata */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Durata e Tipo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo Abbonamento *
                  </label>
                  <select
                    value={formData.duration_unit}
                    onChange={(e) => handleInputChange('duration_unit', e.target.value as DurationUnitType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="days">Giornaliero</option>
                    <option value="weeks">Settimanale</option>
                    <option value="months">Mensile</option>
                    <option value="years">Annuale</option>
                    <option value="credits">A Crediti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.duration_unit === 'credits' ? 'Numero Crediti *' : 'Durata *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration_unit === 'credits' ? formData.credits_included : formData.duration_value}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1
                      if (formData.duration_unit === 'credits') {
                        handleInputChange('credits_included', value)
                      } else {
                        handleInputChange('duration_value', value)
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.duration_value || errors.credits_included ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1"
                  />
                  {errors.duration_value && <p className="text-red-500 text-xs mt-1">{errors.duration_value}</p>}
                  {errors.credits_included && <p className="text-red-500 text-xs mt-1">{errors.credits_included}</p>}
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Anteprima Abbonamento</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-blue-700 font-medium">Nome:</span>
                    <span className="ml-2 text-blue-900">{formData.name || 'Nome abbonamento'}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Prezzo:</span>
                    <span className="ml-2 text-blue-900">€{formData.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Durata:</span>
                    <span className="ml-2 text-blue-900">{getDurationPreview()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stato */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Hash className="w-5 h-5 mr-2 text-gray-600" />
                Stato
              </h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Abbonamento attivo (disponibile per la vendita)
                </label>
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