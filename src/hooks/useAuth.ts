import { useState, useEffect } from 'react'
import { supabase, User } from '../lib/supabase'

// UTENTE FISSO PER BYPASSARE L'AUTENTICAZIONE
const FIXED_USER: User = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  nome: 'Patrick',
  cognome: 'Cioni',
  email: 'patrick.cioni@admin.com',
  telefono: '+39 123 456 7890',
  ruolo: 'admin',
  attivo: true,
  gym_id: 'b1ffcc99-8d1c-5fg9-cc7e-7cc0ce491b22',
  avatar_url: null,
  ultimo_accesso: new Date().toISOString(),
  creato_il: new Date().toISOString()
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false) // SEMPRE FALSE

  useEffect(() => {
    // IMPOSTA IMMEDIATAMENTE L'UTENTE FISSO
    setUser(FIXED_USER)
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // ACCETTA QUALSIASI CREDENZIALE
    setUser(FIXED_USER)
    return { success: true }
  }

  const signOut = async () => {
    // LOGOUT FITTIZIO
    setUser(null)
  }

  const isAdmin = true
  const isSuperAdmin = user?.ruolo === 'super_admin'

  return {
    user,
    loading: false, // SEMPRE FALSE
    signIn,
    signOut,
    isAdmin,
    isSuperAdmin
  }
}