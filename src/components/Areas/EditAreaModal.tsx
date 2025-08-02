import React, { useState, useEffect } from 'react'
import { X, MapPin, Users, Image, Save, AlertCircle } from 'lucide-react'
import { supabase, Area } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface EditAreaModalProps {
  isOpen: boolean
  onClose: () => void
  onAreaUpdated: () => void
  area: Area | null
}

interface AreaFormData {
  nome: string
  descrizione: string
  capacita_max: number
  attiva: boolean
  immagine_url: string
}

export function EditAreaModal({ isOpen, onClose, onAreaUpdated, area }: EditAreaModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<AreaFormData>({
    nome: '',
    descrizione: '',
    capacita_max: 0,
    attiva: true,
    immagine_url: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-populate form when area changes
  useEffect(() => {
    if (area) {
      setFormData({
        nome: area.nome || '',
        descrizione: area.descrizione || '',
        capacita_max: area.capacita_max || 0,
        attiva: area.attiva ?? true,
        immagine_url: area.immagine_url || ''
      })
    }
  }, [area])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Il nome dell\'area è obbligatorio'
    }

    if (formData.capacita_max < 0) {
      newErrors.capacita_max = 'La capacità massima non può essere negativa'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!area || !validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const areaData = {
        nome: formData.nome.trim(),
        descrizione: formData.descrizione.trim() || null,
        capacita_max: formData.capacita_max,
        attiva: formData.attiva,
        immagine_url: formData.immagine_url.trim() || null
      }

      const { data, error } = await supabase
        .from('areas')
        .update(areaData)
        .eq('id', area.id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Area aggiornata:', data)
      
      onAreaUpdated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore aggiornamento area:', error)
      setErrors({ submit: error.message || 'Errore durante l\'aggiornamento dell\'area' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof AreaFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen || !area) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Modifica Area</h2>
              <p className="text-sm text-gray-600">Aggiorna i dettagli di {area.nome}</p>
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
                <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                Dettagli Area
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Area *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nome ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="es. Sala Pesi, Sala Corsi A, Piscina"
                  />
                  {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    value={formData.descrizione}
                    onChange={(e) => handleInputChange('descrizione', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrizione dell'area, attrezzature presenti, ecc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacità Massima
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.capacita_max}
                    onChange={(e) => handleInputChange('capacita_max', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.capacita_max ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.capacita_max && <p className="text-red-500 text-xs mt-1">{errors.capacita_max}</p>}
                </div>
              </div>
            </div>

            {/* Immagine e Stato */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Image className="w-5 h-5 mr-2 text-gray-600" />
                Immagine e Stato
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Immagine
                  </label>
                  <input
                    type="text"
                    value={formData.immagine_url}
                    onChange={(e) => handleInputChange('immagine_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/immagine.jpg"
                  />
                  {formData.immagine_url && (
                    <div className="mt-2 w-32 h-32 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={formData.immagine_url} alt="Anteprima" className="object-cover w-full h-full" />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="attiva"
                    checked={formData.attiva}
                    onChange={(e) => handleInputChange('attiva', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="attiva" className="ml-2 block text-sm text-gray-900">
                    Area attiva (visibile e utilizzabile)
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