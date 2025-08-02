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
  data_fine: string
  rinnovo_automatico: boolean
  attivo: boolean
}

export function NewSubscriptionModal({ isOpen, onClose, onSubscriptionCreated }: NewSubscriptionModalProps) {
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [products, setProducts] = useState<SubscriptionProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<SubscriptionProduct | null>(null)
  const [formData, setFormData] = useState<SubscriptionFormData>({
    member_id: '',
    product_id: '',
    data_inizio: new Date().toISOString().split('T')[0],
    data_fine: '',
    rinnovo_automatico: false,
    attivo: true
  })
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedProduct && formData.data_inizio) {
      calculateEndDate()
    }
  }, [selectedProduct, formData.data_inizio])

  const fetchData = async () => {
    try {
      setLoadingData(true)
      
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('stato', 'attivo')
        .order('nome', { ascending: true })

      if (membersError) throw membersError

      // Fetch subscription products
      const { data: productsData, error: productsError } = await supabase
        .from('subscription_products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (productsError) throw productsError

      setMembers(membersData || [])
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const calculateEndDate = () => {
    if (!selectedProduct || !formData.data_inizio) return

    const startDate = new Date(formData.data_inizio)
    let endDate = new Date(startDate)

    switch (selectedProduct.duration_unit) {
      case 'days':
        endDate.setDate(startDate.getDate() + selectedProduct.duration_value)
        break
      case 'weeks':
        endDate.setDate(startDate.getDate() + (selectedProduct.duration_value * 7))
        break
      case 'months':
        endDate.setMonth(startDate.getMonth() + selectedProduct.duration_value)
        break
      case 'years':
        endDate.setFullYear(startDate.getFullYear() + selectedProduct.duration_value)
        break
      case 'credits':
        // Per abbonamenti a crediti, non impostiamo una data di fine
        setFormData(prev => ({ ...prev, data_fine: '' }))
        return
    }

    setFormData(prev => ({ ...prev, data_fine: endDate.toISOString().split('T')[0] }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.member_id) {
      newErrors.member_id = 'Seleziona un membro'
    }

    if (!formData.product_id) {
      newErrors.product_id = 'Seleziona un prodotto abbonamento'
    }

    if (!formData.data_inizio) {
      newErrors.data_inizio = 'La data di inizio è obbligatoria'
    }

    if (selectedProduct?.duration_unit !== 'credits' && !formData.data_fine) {
      newErrors.data_fine = 'La data di fine è obbligatoria per questo tipo di abbonamento'
    }

    if (formData.data_fine && formData.data_inizio && new Date(formData.data_fine) <= new Date(formData.data_inizio)) {
      newErrors.data_fine = 'La data di fine deve essere successiva alla data di inizio'
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
      const subscriptionData = {
        member_id: formData.member_id,
        product_id: formData.product_id,
        data_inizio: formData.data_inizio,
        data_fine: formData.data_fine || null,
        crediti_usati: 0, // Inizia sempre con 0 crediti usati
        rinnovo_automatico: formData.rinnovo_automatico,
        attivo: formData.attivo,
        creato_da: user?.id || null
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
        data_fine: '',
        rinnovo_automatico: false,
        attivo: true
      })
      setSelectedProduct(null)
      
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
    
    // Handle product selection
    if (field === 'product_id') {
      const product = products.find(p => p.id === value)
      setSelectedProduct(product || null)
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getSelectedMember = () => {
    return members.find(m => m.id === formData.member_id)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nuovo Abbonamento</h2>
              <p className="text-sm text-gray-600">Crea un abbonamento per un membro</p>
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
            {/* Loading State */}
            {loadingData && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">Caricamento dati...</span>
              </div>
            )}

            {!loadingData && (
              <>
                {/* Error generale */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{errors.submit}</span>
                  </div>
                )}

                {/* Selezione Membro */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-600" />
                    Seleziona Membro
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membro *
                    </label>
                    <select
                      value={formData.member_id}
                      onChange={(e) => handleInputChange('member_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.member_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleziona un membro...</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.nome} {member.cognome} {member.email && `(${member.email})`}
                        </option>
                      ))}
                    </select>
                    {errors.member_id && <p className="text-red-500 text-xs mt-1">{errors.member_id}</p>}
                  </div>

                  {/* Member Info Preview */}
                  {getSelectedMember() && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Informazioni Membro</h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-blue-700 font-medium">Nome:</span>
                          <span className="ml-2 text-blue-900">
                            {getSelectedMember()?.nome} {getSelectedMember()?.cognome}
                          </span>
                        </div>
                        {getSelectedMember()?.email && (
                          <div>
                            <span className="text-blue-700 font-medium">Email:</span>
                            <span className="ml-2 text-blue-900">{getSelectedMember()?.email}</span>
                          </div>
                        )}
                        {getSelectedMember()?.telefono && (
                          <div>
                            <span className="text-blue-700 font-medium">Telefono:</span>
                            <span className="ml-2 text-blue-900">{getSelectedMember()?.telefono}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selezione Prodotto */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-gray-600" />
                    Seleziona Prodotto Abbonamento
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prodotto Abbonamento *
                    </label>
                    <select
                      value={formData.product_id}
                      onChange={(e) => handleInputChange('product_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.product_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleziona un prodotto...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - €{product.price} 
                          {product.duration_unit === 'credits' 
                            ? ` (${product.credits_included} crediti)`
                            : ` (${product.duration_value} ${product.duration_unit})`
                          }
                        </option>
                      ))}
                    </select>
                    {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                  </div>

                  {/* Product Info Preview */}
                  {selectedProduct && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-900 mb-2">Dettagli Prodotto</h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-purple-700 font-medium">Nome:</span>
                          <span className="ml-2 text-purple-900">{selectedProduct.name}</span>
                        </div>
                        <div>
                          <span className="text-purple-700 font-medium">Prezzo:</span>
                          <span className="ml-2 text-purple-900">€{selectedProduct.price}</span>
                        </div>
                        <div>
                          <span className="text-purple-700 font-medium">Durata:</span>
                          <span className="ml-2 text-purple-900">
                            {selectedProduct.duration_unit === 'credits' 
                              ? `${selectedProduct.credits_included} crediti`
                              : `${selectedProduct.duration_value} ${selectedProduct.duration_unit}`
                            }
                          </span>
                        </div>
                        {selectedProduct.description && (
                          <div>
                            <span className="text-purple-700 font-medium">Descrizione:</span>
                            <span className="ml-2 text-purple-900">{selectedProduct.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Date e Configurazione */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                    Periodo e Configurazione
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.data_inizio ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.data_inizio && <p className="text-red-500 text-xs mt-1">{errors.data_inizio}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Fine {selectedProduct?.duration_unit !== 'credits' && '*'}
                      </label>
                      <input
                        type="date"
                        value={formData.data_fine}
                        onChange={(e) => handleInputChange('data_fine', e.target.value)}
                        disabled={selectedProduct?.duration_unit === 'credits'}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.data_fine ? 'border-red-300' : 'border-gray-300'
                        } ${selectedProduct?.duration_unit === 'credits' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                      {errors.data_fine && <p className="text-red-500 text-xs mt-1">{errors.data_fine}</p>}
                      {selectedProduct?.duration_unit === 'credits' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Gli abbonamenti a crediti non hanno data di scadenza
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rinnovo_automatico"
                        checked={formData.rinnovo_automatico}
                        onChange={(e) => handleInputChange('rinnovo_automatico', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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