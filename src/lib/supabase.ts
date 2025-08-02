import { createClient } from '@supabase/supabase-js'

// Esporta le variabili di configurazione per poterle controllare altrove
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project-url.supabase.co'
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

// Crea il client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Aggiungi le proprietà al client per poterle controllare facilmente
supabase.supabaseUrl = supabaseUrl
supabase.supabaseKey = supabaseKey

export type UserRole = 'super_admin' | 'admin' | 'trainer' | 'staff'
export type MemberStatus = 'attivo' | 'scaduto' | 'sospeso'
export type SubscriptionType = 'mensile' | 'trimestrale' | 'annuale' | 'a_crediti'
export type BookingStatus = 'prenotato' | 'presente' | 'no_show' | 'disdetto'
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

export interface Subscription {
  id: string
  member_id: string
  tipo: SubscriptionType
  nome: string
  data_inizio: string
  data_fine?: string
  crediti_totali: number
  crediti_usati: number
  prezzo?: number
  rinnovo_automatico: boolean
  attivo: boolean
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
}