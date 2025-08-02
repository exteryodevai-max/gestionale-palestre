import React, { useState, useEffect } from 'react'
import { X, Calendar, User, MapPin, Clock, Save, AlertCircle, Trash2 } from 'lucide-react'
import { supabase, Course, Area, User as UserType, CourseInstanceWithRelations } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface EditCourseInstanceModalProps {
  isOpen: boolean
  onClose: () => void
  onInstanceUpdated: () => void
  instance: CourseInstanceWithRelations | null
}

interface InstanceFormData {
  course_id: string
  trainer_id: string
  area_id: string
  date: string
  time: string
  max_capacity: number
  is_cancelled: boolean
}

export function EditCourseInstanceModal({ isOpen, onClose, onInstanceUpdated, instance }: EditCourseInstanceModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<InstanceFormData>({
    course_id: '',
    trainer_id: '',
    area_id: '',
    date: '',
    time: '',
    max_capacity: 10,
    is_cancelled: false
  })
  
  const [courses, setCourses] = useState<Course[]>([])
  const [trainers, setTrainers] = useState<UserType[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && instance) {
      fetchCourses()
      fetchTrainers()
      fetchAreas()
      
      // Pre-populate form
      const startTime = new Date(instance.start_time)
      setFormData({
        course_id: instance.course_id,
        trainer_id: instance.trainer_id,
        area_id: instance.area_id,
        date: startTime.toISOString().split('T')[0],
        time: startTime.toTimeString().slice(0, 5),
        max_capacity: instance.max_capacity,
        is_cancelled: instance.is_cancelled
      })
    }
  }, [isOpen, instance])

  useEffect(() => {
    if (formData.course_id) {
      const course = courses.find(c => c.id === formData.course_id)
      setSelectedCourse(course || null)
    }
  }, [formData.course_id, courses])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('visibile', true)
        .order('nome', { ascending: true })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nome, cognome')
        .eq('ruolo', 'trainer')
        .eq('attivo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      setTrainers(data || [])
    } catch (error) {
      console.error('Error fetching trainers:', error)
    }
  }

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('id, nome')
        .eq('attiva', true)
        .order('nome', { ascending: true })

      if (error) throw error
      setAreas(data || [])
    } catch (error) {
      console.error('Error fetching areas:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.course_id) {
      newErrors.course_id = 'Seleziona un corso'
    }

    if (!formData.trainer_id) {
      newErrors.trainer_id = 'Seleziona un trainer'
    }

    if (!formData.area_id) {
      newErrors.area_id = 'Seleziona un\'area'
    }

    if (!formData.date) {
      newErrors.date = 'Seleziona una data'
    }

    if (!formData.time) {
      newErrors.time = 'Seleziona un orario'
    }

    if (formData.max_capacity <= 0) {
      newErrors.max_capacity = 'La capacità deve essere maggiore di 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!instance || !validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Combine date and time to create start_time
      const startDateTime = new Date(`${formData.date}T${formData.time}:00`)
      
      // Calculate end_time based on course duration
      const endDateTime = new Date(startDateTime)
      if (selectedCourse) {
        endDateTime.setMinutes(startDateTime.getMinutes() + selectedCourse.durata_minuti)
      }

      const instanceData = {
        course_id: formData.course_id,
        trainer_id: formData.trainer_id,
        area_id: formData.area_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        max_capacity: formData.max_capacity,
        is_cancelled: formData.is_cancelled,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('course_instances')
        .update(instanceData)
        .eq('id', instance.id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Istanza corso aggiornata:', data)
      
      onInstanceUpdated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore aggiornamento istanza corso:', error)
      setErrors({ submit: error.message || 'Errore durante l\'aggiornamento dell\'istanza corso' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!instance) return

    if (!confirm('Sei sicuro di voler eliminare questa istanza di corso?')) {
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('course_instances')
        .delete()
        .eq('id', instance.id)

      if (error) throw error

      console.log('✅ Istanza corso eliminata:', instance.id)
      
      onInstanceUpdated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore eliminazione istanza corso:', error)
      setErrors({ submit: error.message || 'Errore durante l\'eliminazione dell\'istanza corso' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof InstanceFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen || !instance) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Modifica Istanza Corso</h2>
              <p className="text-sm text-gray-600">
                {instance.course.nome} - {new Date(instance.start_time).toLocaleDateString('it-IT')}
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

            {/* Selezione Corso */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Corso
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleziona Corso *
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => handleInputChange('course_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.course_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleziona un corso...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.nome} ({course.durata_minuti} min)
                    </option>
                  ))}
                </select>
                {errors.course_id && <p className="text-red-500 text-xs mt-1">{errors.course_id}</p>}
              </div>
            </div>

            {/* Trainer e Area */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Assegnazioni
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trainer *
                  </label>
                  <select
                    value={formData.trainer_id}
                    onChange={(e) => handleInputChange('trainer_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.trainer_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleziona un trainer...</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.nome} {trainer.cognome}
                      </option>
                    ))}
                  </select>
                  {errors.trainer_id && <p className="text-red-500 text-xs mt-1">{errors.trainer_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area *
                  </label>
                  <select
                    value={formData.area_id}
                    onChange={(e) => handleInputChange('area_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.area_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleziona un'area...</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nome}
                      </option>
                    ))}
                  </select>
                  {errors.area_id && <p className="text-red-500 text-xs mt-1">{errors.area_id}</p>}
                </div>
              </div>
            </div>

            {/* Data e Orario */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Programmazione
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orario Inizio *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.time ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacità Massima *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_capacity}
                    onChange={(e) => handleInputChange('max_capacity', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.max_capacity ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.max_capacity && <p className="text-red-500 text-xs mt-1">{errors.max_capacity}</p>}
                </div>
              </div>

              {/* Stato */}
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_cancelled"
                    checked={formData.is_cancelled}
                    onChange={(e) => handleInputChange('is_cancelled', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_cancelled" className="ml-2 block text-sm text-gray-900">
                    Istanza cancellata (non verrà mostrata nel calendario)
                  </label>
                </div>
              </div>
            </div>

            {/* Informazioni Aggiuntive */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Informazioni Istanza</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Prenotazioni Attuali:</span>
                  <span className="ml-2 text-blue-900">{instance.current_bookings_count}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Posti Disponibili:</span>
                  <span className="ml-2 text-blue-900">{instance.max_capacity - instance.current_bookings_count}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Creata il:</span>
                  <span className="ml-2 text-blue-900">{new Date(instance.created_at).toLocaleDateString('it-IT')}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Ultima modifica:</span>
                  <span className="ml-2 text-blue-900">{new Date(instance.updated_at).toLocaleDateString('it-IT')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Elimina</span>
            </button>
            
            <div className="flex items-center space-x-4">
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
          </div>
        </form>
      </div>
    </div>
  )
}