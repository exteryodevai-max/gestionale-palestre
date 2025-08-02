import React, { useState, useEffect } from 'react'
import { X, Dumbbell, MapPin, User, Clock, Users, Euro, Palette, Save, AlertCircle } from 'lucide-react'
import { supabase, Course, Area, User as UserType } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface EditCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onCourseUpdated: () => void
  course: Course | null
  areas: Area[]
  trainers: UserType[]
}

interface CourseFormData {
  nome: string
  descrizione: string
  area_id: string
  trainer_id: string
  capacita: number
  durata_minuti: number
  prezzo: number
  visibile: boolean
  colore: string
}

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

export function EditCourseModal({ isOpen, onClose, onCourseUpdated, course, areas, trainers }: EditCourseModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CourseFormData>({
    nome: '',
    descrizione: '',
    area_id: '',
    trainer_id: '',
    capacita: 10,
    durata_minuti: 60,
    prezzo: 0,
    visibile: true,
    colore: '#3B82F6'
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-populate form when course changes
  useEffect(() => {
    if (course) {
      setFormData({
        nome: course.nome || '',
        descrizione: course.descrizione || '',
        area_id: course.area_id || '',
        trainer_id: course.trainer_id || '',
        capacita: course.capacita || 10,
        durata_minuti: course.durata_minuti || 60,
        prezzo: course.prezzo || 0,
        visibile: course.visibile ?? true,
        colore: course.colore || '#3B82F6'
      })
    }
  }, [course])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Il nome del corso è obbligatorio'
    }

    if (formData.capacita <= 0) {
      newErrors.capacita = 'La capacità deve essere maggiore di 0'
    }

    if (formData.durata_minuti <= 0) {
      newErrors.durata_minuti = 'La durata deve essere maggiore di 0'
    }

    if (formData.prezzo < 0) {
      newErrors.prezzo = 'Il prezzo non può essere negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!course || !validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const courseData = {
        nome: formData.nome.trim(),
        descrizione: formData.descrizione.trim() || null,
        area_id: formData.area_id || null,
        trainer_id: formData.trainer_id || null,
        capacita: formData.capacita,
        durata_minuti: formData.durata_minuti,
        prezzo: formData.prezzo || null,
        visibile: formData.visibile,
        colore: formData.colore
      }

      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', course.id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Corso aggiornato:', data)
      
      onCourseUpdated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore aggiornamento corso:', error)
      setErrors({ submit: error.message || 'Errore durante l\'aggiornamento del corso' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CourseFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen || !course) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Dumbbell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Modifica Corso</h2>
              <p className="text-sm text-gray-600">Aggiorna i dettagli di {course.nome}</p>
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
                <Dumbbell className="w-5 h-5 mr-2 text-gray-600" />
                Informazioni Base
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Corso *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nome ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="es. Yoga Mattutino, CrossFit Avanzato, Pilates"
                  />
                  {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    value={formData.descrizione}
                    onChange={(e) => handleInputChange('descrizione', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrizione del corso, obiettivi, livello richiesto..."
                  />
                </div>
              </div>
            </div>

            {/* Area e Trainer */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                Assegnazioni
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  <select
                    value={formData.area_id}
                    onChange={(e) => handleInputChange('area_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleziona un'area...</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trainer
                  </label>
                  <select
                    value={formData.trainer_id}
                    onChange={(e) => handleInputChange('trainer_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleziona un trainer...</option>
                    {trainers.map(trainer => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.nome} {trainer.cognome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dettagli Corso */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Dettagli Corso
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacità Massima *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacita}
                    onChange={(e) => handleInputChange('capacita', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.capacita ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="10"
                  />
                  {errors.capacita && <p className="text-red-500 text-xs mt-1">{errors.capacita}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durata (minuti) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durata_minuti}
                    onChange={(e) => handleInputChange('durata_minuti', parseInt(e.target.value) || 60)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.durata_minuti ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="60"
                  />
                  {errors.durata_minuti && <p className="text-red-500 text-xs mt-1">{errors.durata_minuti}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prezzo (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.prezzo}
                    onChange={(e) => handleInputChange('prezzo', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.prezzo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.prezzo && <p className="text-red-500 text-xs mt-1">{errors.prezzo}</p>}
                </div>
              </div>
            </div>

            {/* Aspetto e Visibilità */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-gray-600" />
                Aspetto e Visibilità
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colore Corso
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {defaultColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleInputChange('colore', color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.colore === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={formData.colore}
                    onChange={(e) => handleInputChange('colore', e.target.value)}
                    className="mt-2 w-16 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="visibile"
                    checked={formData.visibile}
                    onChange={(e) => handleInputChange('visibile', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="visibile" className="ml-2 block text-sm text-gray-900">
                    Corso visibile (disponibile per le prenotazioni)
                  </label>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg p-6 border-2 border-dashed border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Anteprima Corso</h3>
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: formData.colore + '20' }}
                >
                  <Dumbbell className="w-6 h-6" style={{ color: formData.colore }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{formData.nome || 'Nome Corso'}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formData.durata_minuti} min
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Max {formData.capacita}
                    </span>
                    {formData.prezzo > 0 && (
                      <span className="flex items-center">
                        <Euro className="w-4 h-4 mr-1" />
                        €{formData.prezzo.toFixed(2)}
                      </span>
                    )}
                  </div>
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