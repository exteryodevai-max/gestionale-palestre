import React, { useState, useEffect } from 'react'
import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Plus, Filter, Calendar as CalendarIcon, User, MapPin, Clock } from 'lucide-react'
import { supabase, CourseInstanceWithRelations, Area, User as UserType } from '../../lib/supabase'
import { NewCourseInstanceModal } from './NewCourseInstanceModal'
import { EditCourseInstanceModal } from './EditCourseInstanceModal'

// Configure moment localizer
moment.locale('it')
const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: CourseInstanceWithRelations
}

export function CalendarView() {
  const [courseInstances, setCourseInstances] = useState<CourseInstanceWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<View>('week')
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<CourseInstanceWithRelations | null>(null)
  const [trainerFilter, setTrainerFilter] = useState<string>('all')
  const [areaFilter, setAreaFilter] = useState<string>('all')
  const [trainers, setTrainers] = useState<UserType[]>([])
  const [areas, setAreas] = useState<Area[]>([])

  useEffect(() => {
    fetchCourseInstances()
    fetchTrainers()
    fetchAreas()
  }, [])

  const fetchCourseInstances = async () => {
    try {
      const { data, error } = await supabase
        .from('course_instances')
        .select(`
          *,
          course:courses!inner(
            nome,
            descrizione,
            colore,
            durata_minuti
          ),
          trainer:users!inner(
            nome,
            cognome
          ),
          area:areas!inner(
            nome
          )
        `)
        .eq('is_cancelled', false)
        .order('start_time', { ascending: true })

      if (error) throw error
      setCourseInstances(data || [])
    } catch (error) {
      console.error('Error fetching course instances:', error)
    } finally {
      setLoading(false)
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

  const handleInstanceCreated = () => {
    fetchCourseInstances()
  }

  const handleInstanceUpdated = () => {
    fetchCourseInstances()
    setSelectedInstance(null)
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedInstance(event.resource)
    setShowEditModal(true)
  }

  const handleSelectSlot = ({ start }: { start: Date }) => {
    // Set default start time for new instance
    setShowNewModal(true)
  }

  // Filter course instances based on selected filters
  const filteredInstances = courseInstances.filter(instance => {
    const matchesTrainer = trainerFilter === 'all' || instance.trainer_id === trainerFilter
    const matchesArea = areaFilter === 'all' || instance.area_id === areaFilter
    return matchesTrainer && matchesArea
  })

  // Convert course instances to calendar events
  const events: CalendarEvent[] = filteredInstances.map(instance => ({
    id: instance.id,
    title: `${instance.course.nome} - ${instance.trainer.nome} ${instance.trainer.cognome}`,
    start: new Date(instance.start_time),
    end: new Date(instance.end_time),
    resource: instance
  }))

  // Custom event style based on course color
  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.resource.course.colore || '#3B82F6'
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px'
      }
    }
  }

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="text-xs">
      <div className="font-semibold truncate">{event.resource.course.nome}</div>
      <div className="truncate">{event.resource.trainer.nome} {event.resource.trainer.cognome}</div>
      <div className="truncate text-gray-200">{event.resource.area.nome}</div>
    </div>
  )

  const calculateStats = () => {
    const totalInstances = filteredInstances.length
    const todayInstances = filteredInstances.filter(instance => {
      const today = new Date()
      const instanceDate = new Date(instance.start_time)
      return instanceDate.toDateString() === today.toDateString()
    }).length
    const uniqueTrainers = new Set(filteredInstances.map(i => i.trainer_id)).size
    const uniqueAreas = new Set(filteredInstances.map(i => i.area_id)).size

    return { totalInstances, todayInstances, uniqueTrainers, uniqueAreas }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Caricamento calendario...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario Corsi</h1>
          <p className="text-gray-600 mt-1">
            Programmazione corsi e assegnazione trainer
          </p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuova Istanza Corso</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Corsi Programmati</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalInstances}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Corsi Oggi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayInstances}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trainer Attivi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.uniqueTrainers}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aree Utilizzate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.uniqueAreas}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
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
                <option key={trainer.id} value={trainer.id}>
                  {trainer.nome} {trainer.cognome}
                </option>
              ))}
            </select>
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
                <option key={area.id} value={area.id}>
                  {area.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            views={['month', 'week', 'day']}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent
            }}
            messages={{
              next: 'Successivo',
              previous: 'Precedente',
              today: 'Oggi',
              month: 'Mese',
              week: 'Settimana',
              day: 'Giorno',
              agenda: 'Agenda',
              date: 'Data',
              time: 'Ora',
              event: 'Evento',
              noEventsInRange: 'Nessun corso programmato in questo periodo',
              showMore: (total) => `+${total} altri`
            }}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              dayHeaderFormat: 'dddd DD/MM',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM')}`
            }}
            min={new Date(2024, 0, 1, 6, 0)} // 6:00 AM
            max={new Date(2024, 0, 1, 23, 0)} // 11:00 PM
            step={30}
            timeslots={2}
          />
        </div>
      </div>

      {/* New Course Instance Modal */}
      <NewCourseInstanceModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onInstanceCreated={handleInstanceCreated}
      />

      {/* Edit Course Instance Modal */}
      <EditCourseInstanceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedInstance(null)
        }}
        onInstanceUpdated={handleInstanceUpdated}
        instance={selectedInstance}
      />
    </div>
  )
}