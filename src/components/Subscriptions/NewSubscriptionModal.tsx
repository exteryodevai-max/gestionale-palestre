import React, { useState, useEffect } from 'react'
import { X, CreditCard, User, Calendar, Package, Save, AlertCircle } from 'lucide-react'
import { supabase, Member, SubscriptionProduct } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface NewSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscriptionCreated: () => void
}

interface SubscriptionFormData {
  member_id: string
  product_id: string
  data_inizio: string
  rinnovo_automatico: boolean
  attivo: boolean
}

export function NewSubscriptionModal({ isOpen, onClose, onSubscriptionCreated }: NewSubscriptionModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<SubscriptionFormData>({
    member_id: '',
    product_id: '',
    data_inizio: new Date().toISOString().split('T')[0], // Today's date
    rinnovo_automatico: false,
    attivo: true
  })
  
  const [members, setMembers] = useState<Member[]>([])
  const [products, setProducts] = useState<SubscriptionProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedProduct, setSelectedProduct] = useState<SubscriptionProduct | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchMembers()
      fetchProducts()
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.product_id) {
      const product = products.find(p => p.id === formData.product_id)
      setSelectedProduct(product || null)
    } else {
      setSelectedProduct(null)
    }
  }, [formData.product_id, products])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, nome, cognome, email, stato')
        .eq('stato', 'attivo')
        .order('nome', { ascending: true })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
      setErrors({ members: 'Errore nel caricamento dei membri' })
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setErrors({ products: 'Errore nel caricamento dei prodotti' })
    } finally {
      setLoadingData(false)
    }
  }

  const calculateEndDate = (startDate: string, product: SubscriptionProduct): string | null => {
    if (product.duration_unit === 'credits') {
      return null // Credits-based subscriptions don't have an end date
    }

    const start = new Date(startDate)
    let endDate = new Date(start)

    switch (product.duration_unit) {
      case 'days':
        endDate.setDate(start.getDate() + product.duration_value)
        break
      case 'weeks':
        endDate.setDate(start.getDate() + (product.duration_value * 7))
        break
      case 'months':
        endDate.setMonth(start.getMonth() + product.duration_value)
        break
      case 'years':
        endDate.setFullYear(start.getFullYear() + product.duration_value)
        break
      default:
        return null
    }

    return endDate.toISOString().split('T')[0]
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.member_id) {
      newErrors.member_id = 'Seleziona un membro'
    }

    if (!formData.product_id) {
      newErrors.product_id = 'Seleziona un prodotto'
    }

    if (!formData.data_inizio) {
      newErrors.data_inizio = 'La data di inizio è obbligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!selectedProduct) {
      setErrors({ submit: 'Prodotto non trovato' })
      return
    }

    setLoading(true)
    
    try {
      const endDate = calculateEndDate(formData.data_inizio, selectedProduct)
      
      const subscriptionData = {
        member_id: formData.member_id,
        product_id: formData.product_id,
        data_inizio: formData.data_inizio,
        data_fine: endDate,
        crediti_usati: 0, // Start with 0 credits used
        rinnovo_automatico: formData.rinnovo_automatico,
        attivo: formData.attivo,
        creato_da: user?.id
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Nuovo abbonamento creato:', data)
      
      // Reset form
      setFormData({
        member_id: '',
        product_id: '',
        data_inizio: new Date().toISOString().split('T')[0],
        rinnovo_automatico: false,
        attivo: true
      })
      
      onSubscriptionCreated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore creazione abbonamento:', error)
      setErrors({ submit: error.message || 'Errore durante la creazione dell\'abbonamento' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof SubscriptionFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getDurationLabel = (product: SubscriptionProduct) => {
    const labels = {
      days: product.duration_value === 1 ? 'Giorno' : 'Giorni',
      weeks: product.duration_value === 1 ? 'Settimana' : 'Settimane', 
      months: product.duration_value === 1 ? 'Mese' : 'Mesi',
      years: product.duration_value === 1 ? 'Anno' : 'Anni',
      credits: 'Crediti'
    }
    return `${product.duration_value} ${labels[product.duration_unit]}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nuovo Abbonamento</h2>
              <p className="text-sm text-gray-600">Crea un nuovo abbonamento per un membro</p>
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

            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Caricamento dati...</span>
              </div>
            ) : (
              <>
                {/* Selezione Membro */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-600" />
                    Selezione Membro
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membro *
                    </label>
                    <select
                      value={formData.member_id}
                      onChange={(e) => handleInputChange('member_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.member_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleziona un membro</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.nome} {member.cognome} {member.email && `(${member.email})`}
                        </option>
                      ))}
                    </select>
                    {errors.member_id && <p className="text-red-500 text-xs mt-1">{errors.member_id}</p>}
                    {errors.members && <p className="text-red-500 text-xs mt-1">{errors.members}</p>}
                  </div>
                </div>

                {/* Selezione Prodotto */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-gray-600" />
                    Selezione Prodotto
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prodotto Abbonamento *
                    </label>
                    <select
                      value={formData.product_id}
                      onChange={(e) => handleInputChange('product_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.product_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleziona un prodotto</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - €{product.price} ({getDurationLabel(product)})
                        </option>
                      ))}
                    </select>
                    {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                    {errors.products && <p className="text-red-500 text-xs mt-1">{errors.products}</p>}
                  </div>

                  {/* Product Details */}
                  {selectedProduct && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Dettagli Prodotto</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">Prezzo:</span>
                          <span className="ml-2 text-blue-900">€{selectedProduct.price}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Durata:</span>
                          <span className="ml-2 text-blue-900">{getDurationLabel(selectedProduct)}</span>
                        </div>
                        {selectedProduct.credits_included && (
                          <div>
                            <span className="text-blue-700 font-medium">Crediti inclusi:</span>
                            <span className="ml-2 text-blue-900">{selectedProduct.credits_included}</span>
                          </div>
                        )}
                        {selectedProduct.description && (
                          <div className="col-span-2">
                            <span className="text-blue-700 font-medium">Descrizione:</span>
                            <span className="ml-2 text-blue-900">{selectedProduct.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Configurazione Abbonamento */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                    Configurazione Abbonamento
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

                    {selectedProduct && formData.data_inizio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data Fine (Calcolata)
                        </label>
                        <input
                          type="text"
                          value={
                            selectedProduct.duration_unit === 'credits' 
                              ? 'Nessuna scadenza (a crediti)' 
                              : calculateEndDate(formData.data_inizio, selectedProduct) || 'N/A'
                          }
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
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
                        Abbonamento attivo
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
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
              disabled={loading || loadingData}
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
                  <span>Crea Abbonamento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}