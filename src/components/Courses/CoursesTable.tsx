import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, Dumbbell, X, AlertCircle, Calendar, Euro, Users } from 'lucide-react'
import { supabase, Course, Area, User } from '../../lib/supabase'
import { NewCourseModal } from './NewCourseModal'
import { EditCourseModal } from './EditCourseModal'

interface CourseWithRelations extends Course {
  area?: { nome: string }
  trainer?: { nome: string; cognome: string }
}

export function CoursesTable() {
  const [courses, setCourses] = useState<CourseWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [areaFilter, setAreaFilter] = useState<string>('all')
  const [trainerFilter, setTrainerFilter] = useState<string>('all')
  const [showNewCourseModal, setShowNewCourseModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [areas, setAreas] = useState<Area[]>([])
  const [trainers, setTrainers] = useState<User[]>([])

  useEffect(() => {
    fetchCourses()
    fetchAreas()
    fetchTrainers()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          area:areas(nome),
          trainer:users(nome, cognome)
        `)
        .order('creato_il', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('id, nome')
        .order('nome', { ascending: true })
      if (error) throw error
      setAreas(data || [])
    } catch (error) {
      console.error('Error fetching areas:', error)
    }
  }

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nome, cognome')
        .eq('ruolo', 'trainer')
        .order('nome', { ascending: true })
      if (error) throw error
      setTrainers(data || [])
    } catch (error) {
      console.error('Error fetching trainers:', error)
    }
  }

  const handleCourseCreated = () => {
    fetchCourses()
  }

  const handleCourseUpdated = () => {
    fetchCourses()
    setSelectedCourse(null)
  }

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course)
    setShowEditModal(true)
  }

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseToDelete.id)

      if (error) throw error

      console.log('✅ Corso eliminato:', courseToDelete.nome)
      fetchCourses()
      setShowDeleteConfirm(false)
      setCourseToDelete(null)
    } catch (error: any) {
      console.error('❌ Errore eliminazione corso:', error)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.descrizione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.trainer?.nome && course.trainer.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.trainer?.cognome && course.trainer.cognome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.area?.nome && course.area.nome.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesArea = areaFilter === 'all' || course.area_id === areaFilter
    const matchesTrainer = trainerFilter === 'all' || course.trainer_id === trainerFilter

    return matchesSearch && matchesArea && matchesTrainer
  })

  const getVisibilityBadge = (isVisible: boolean) => {
    return isVisible ? (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Visibile
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Nascosto
      </span>
    )
  }

  const calculateStats = () => {
    const visibleCourses = filteredCourses.filter(c => c.visibile).length
    const totalCourses = filteredCourses.length
    const averageCapacity = filteredCourses.length > 0 
      ? Math.round(filteredCourses.reduce((sum, c) => sum + c.capacita, 0) / filteredCourses.length)
      : 0
    const averageDuration = filteredCourses.length > 0 
      ? Math.round(filteredCourses.reduce((sum, c) => sum + c.durata_minuti, 0) / filteredCourses.length)
      : 0

    return { visibleCourses, totalCourses, averageCapacity, averageDuration }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Caricamento corsi...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Corsi</h1>
          <p className="text-gray-600 mt-1">
            {filteredCourses.length} corsi trovati
          </p>
        </div>
        <button 
          onClick={() => setShowNewCourseModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Corso</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Corsi Visibili</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.visibleCourses}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Dumbbell className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totale Corsi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCourses}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Capacità Media</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.averageCapacity}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Durata Media</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.averageDuration}min</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca per nome, descrizione, trainer o area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Area Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tutte le aree</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.nome}</option>
              ))}
            </select>
          </div>

          {/* Trainer Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tutti i trainer</option>
              {trainers.map(trainer => (
                <option key={trainer.id} value={trainer.id}>{trainer.nome} {trainer.cognome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Corso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dettagli
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: course.colore + '20' }}
                        >
                          <Dumbbell className="h-5 w-5" style={{ color: course.colore }} />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {course.nome}
                        </div>
                        {course.descrizione && (
                          <div className="text-sm text-gray-500">
                            {course.descrizione}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.trainer ? (
                      <div className="text-sm text-gray-900">{course.trainer.nome} {course.trainer.cognome}</div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.area ? (
                      <div className="text-sm text-gray-900">{course.area.nome}</div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{course.durata_minuti} min</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Max {course.capacita}</span>
                    </div>
                    {course.prezzo && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Euro className="w-4 h-4 text-gray-400" />
                        <span>€{course.prezzo.toFixed(2)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getVisibilityBadge(course.visibile)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEditClick(course)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Modifica corso"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(course)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Elimina corso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-1 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun corso trovato</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || areaFilter !== 'all' || trainerFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Inizia creando il primo corso'
              }
            </p>
          </div>
        )}
      </div>

      {/* New Course Modal */}
      <NewCourseModal
        isOpen={showNewCourseModal}
        onClose={() => setShowNewCourseModal(false)}
        onCourseCreated={handleCourseCreated}
        areas={areas}
        trainers={trainers}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedCourse(null)
        }}
        onCourseUpdated={handleCourseUpdated}
        course={selectedCourse}
        areas={areas}
        trainers={trainers}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Conferma Eliminazione</h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setCourseToDelete(null)
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Sei sicuro di voler eliminare il corso:
                    </p>
                    <p className="font-semibold text-gray-900">
                      {courseToDelete.nome}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  ⚠️ Questa azione non può essere annullata. Il corso verrà eliminato definitivamente.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setCourseToDelete(null)
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}