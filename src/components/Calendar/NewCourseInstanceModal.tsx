import React, { useState, useEffect } from 'react'
import { X, Calendar, User, MapPin, Clock, Save, AlertCircle } from 'lucide-react'
import { supabase, Course, Area, User as UserType } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface NewCourseInstanceModalProps {
  isOpen: boolean
  onClose: () => void
  onInstanceCreated: () => void
}

interface InstanceFormData {
  course_id: string
  trainer_id: string
  area_id: string
  start_time: string
  date: string
  time: string
  max_capacity: number
}

export function NewCourseInstanceModal({ isOpen, onClose, onInstanceCreated }: NewCourseInstanceModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<InstanceFormData>({
    course_id: '',
    trainer_id: '',
    area_id: '',
    start_time: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    max_capacity: 10
  })
  
  const [courses, setCourses] = useState<Course[]>([])
  const [trainers, setTrainers] = useState<UserType[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchCourses()
      fetchTrainers()
      fetchAreas()
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.course_id) {
      const course = courses.find(c => c.id === formData.course_id)
      setSelectedCourse(course || null)
      if (course) {
        setFormData(prev => ({
          ...prev,
          area_id: course.area_id || '',
          max_capacity: course.capacita
        }))
      }
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
    
    if (!validateForm()) {
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
        current_bookings_count: 0,
        is_cancelled: false,
        gym_id: user?.gym_id || null
      }

      const { data, error } = await supabase
        .from('course_instances')
        .insert(instanceData)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Nuova istanza corso creata:', data)
      
      // Reset form
      setFormData({
        course_id: '',
        trainer_id: '',
        area_id: '',
        start_time: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        max_capacity: 10
      })
      setSelectedCourse(null)
      
      onInstanceCreated()
      onClose()
      
    } catch (error: any) {
      console.error('❌ Errore creazione istanza corso:', error)
      setErrors({ submit: error.message || 'Errore durante la creazione dell\'istanza corso' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof InstanceFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nuova Istanza Corso</h2>
              <p className="text-sm text-gray-600">Programma un corso con trainer e orario specifici</p>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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

              {/* Anteprima Corso */}
              {selectedCourse && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-medium text-indigo-900 mb-2">Dettagli Corso</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-indigo-700 font-medium">Nome:</span>
                      <span className="ml-2 text-indigo-900">{selectedCourse.nome}</span>
                    </div>
                    <div>
                      <span className="text-indigo-700 font-medium">Durata:</span>
                      <span className="ml-2 text-indigo-900">{selectedCourse.durata_minuti} minuti</span>
                    </div>
                    <div>
                      <span className="text-indigo-700 font-medium">Capacità:</span>
                      <span className="ml-2 text-indigo-900">{selectedCourse.capacita} persone</span>
                    </div>
                    {selectedCourse.descrizione && (
                      <div>
                        <span className="text-indigo-700 font-medium">Descrizione:</span>
                        <span className="ml-2 text-indigo-900">{selectedCourse.descrizione}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.max_capacity ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.max_capacity && <p className="text-red-500 text-xs mt-1">{errors.max_capacity}</p>}
                </div>
              </div>

              {/* Anteprima Orario */}
              {selectedCourse && formData.date && formData.time && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Anteprima Programmazione</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-blue-700 font-medium">Data:</span>
                      <span className="ml-2 text-blue-900">
                        {new Date(formData.date).toLocaleDateString('it-IT', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Orario:</span>
                      <span className="ml-2 text-blue-900">
                        {formData.time} - {(() => {
                          const endTime = new Date(`${formData.date}T${formData.time}:00`)
                          endTime.setMinutes(endTime.getMinutes() + selectedCourse.durata_minuti)
                          return endTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
                        })()}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Durata:</span>
                      <span className="ml-2 text-blue-900">{selectedCourse.durata_minuti} minuti</span>
                    </div>
                  </div>
                </div>
              )}
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
                  <span>Crea Istanza</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}