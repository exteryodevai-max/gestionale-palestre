import { createClient } from '@supabase/supabase-js'

// Verifica che le variabili d'ambiente siano configurate
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Variabili d\'ambiente Supabase mancanti. Assicurati di aver configurato VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nel file .env'
  )
}

// Crea il client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export type UserRole = 'super_admin' | 'admin' | 'trainer' | 'staff'
export type MemberStatus = 'attivo' | 'scaduto' | 'sospeso'
export type DurationUnitType = 'days' | 'weeks' | 'months' | 'years' | 'credits'
export type BookingStatus = 'prenotato' | 'presente' | 'no_show' | 'disdetto' // Keep this line
export type EquipmentStatus = 'attiva' | 'guasta' | 'fuori_uso' | 'manutenzione'
export type NotificationType = 'info' | 'warning' | 'success' | 'error'

export interface User {
  id: string
  nome: string
  cognome: string
  email: string
  telefono?: string
  ruolo: UserRole
  attivo: boolean
  gym_id?: string
  avatar_url?: string
  ultimo_accesso?: string
  creato_il: string
  data_nascita?: string
  indirizzo?: string
  citta?: string
  provincia?: string
  cap?: string
  codice_fiscale?: string
  note?: string
}

export interface Member {
  id: string
  nome: string
  cognome: string
  email?: string
  telefono?: string
  data_nascita?: string
  certificato_valido_fino?: string
  stato: MemberStatus
  tag_nfc_id?: string
  note?: string
  foto_url?: string
  gym_id?: string
  creato_il: string
}

export interface SubscriptionProduct { // New interface for subscription products
  id: string
  name: string
  description?: string
  price: number
  duration_value: number
  duration_unit: DurationUnitType
  credits_included?: number // Number of credits included, if duration_unit is 'credits'
  is_active: boolean
  gym_id?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  member_id: string
  product_id: string // Reference to SubscriptionProduct
  data_inizio: string
  data_fine?: string
  crediti_usati: number // This field remains to track usage
  rinnovo_automatico: boolean
  attivo: boolean
  creato_da?: string
  creato_il: string
}

export interface Course {
  id: string
  nome: string
  descrizione?: string
  area_id?: string
  trainer_id?: string
  capacita: number
  durata_minuti: number
  prezzo?: number
  visibile: boolean
  colore: string
  gym_id?: string
  creato_il: string
}

export interface Equipment {
  id: string
  nome: string
  descrizione?: string
  area_id?: string
  stato: EquipmentStatus
  tag_nfc_id?: string
  codice_seriale?: string
  data_acquisto?: string
  ultima_manutenzione?: string
  prossima_manutenzione?: string
  note_manutenzione?: string
  gym_id?: string
  creato_il: string
}

export interface Area {
  id: string
  nome: string
  descrizione?: string
  capacita_max: number
  gym_id?: string
  attiva: boolean
  immagine_url?: string
  creato_il: string
}

export interface SubscriptionWithMember extends Subscription {
  member: {
    nome: string
    cognome: string
    email?: string
    stato: MemberStatus
  }
  product: SubscriptionProduct
}