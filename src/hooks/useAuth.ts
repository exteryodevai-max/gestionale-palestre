import { useState, useEffect } from 'react'
import { supabase, User } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 useAuth: Inizio controllo sessione')
    
    const checkSession = async () => {
      try {
        setLoading(true)
        setAuthError(null)
        
        console.log('🔍 Controllo sessione Supabase...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Errore nel recupero sessione:', sessionError)
          setAuthError(`Errore sessione: ${sessionError.message}`)
          setUser(null)
          setLoading(false)
          return
        }
        
        console.log('📋 Sessione:', session ? 'presente' : 'assente')
        
        if (session?.user) {
          console.log('👤 Utente autenticato:', session.user.email)
          
          // Prova a recuperare i dati dell'utente dalla tabella users
          console.log('🔍 Recupero dati utente dalla tabella users...')
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle()
            
          if (userError) {
            console.error('❌ Errore nel recupero dati utente:', userError)
            setAuthError(`Errore database: ${userError.message}. Verifica che la tabella 'users' esista e sia configurata correttamente.`)
            setUser(null)
          } else if (!userData) {
            console.warn('⚠️ Utente autenticato ma non trovato nella tabella users')
            setAuthError('Il tuo account non è stato trovato nel database. Contatta l\'amministratore.')
            setUser(null)
            // Non fare logout automatico per ora, per debug
          } else {
            console.log('✅ Dati utente recuperati:', userData.email, userData.ruolo)
            setUser(userData as User)
          }
        } else {
          console.log('👤 Nessun utente autenticato')
          setUser(null)
        }
      } catch (error: any) {
        console.error('💥 Errore generale nel controllo sessione:', error)
        setAuthError(`Errore di sistema: ${error.message}`)
        setUser(null)
      } finally {
        setLoading(false)
        console.log('✅ Controllo sessione completato')
      }
    }
    
    checkSession()
    
    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event)
      
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ Utente loggato:', session.user.email)
        // Ricarica i dati utente
        checkSession()
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Utente disconnesso')
        setUser(null)
        setAuthError(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      console.log('🔐 Tentativo di login per:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Errore di login:', error)
        let errorMessage = error.message
        
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Credenziali non valide. Verifica email e password.'
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Email non confermata. Controlla la tua casella di posta.'
        }
        
        setAuthError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      console.log('✅ Login riuscito per:', email)
      return { success: true }
    } catch (error: any) {
      console.error('💥 Errore durante il login:', error)
      setAuthError(`Errore di sistema: ${error.message}`)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setAuthError(null)
      
      console.log('👋 Logout in corso...')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Errore durante il logout:', error)
        setAuthError(`Errore durante il logout: ${error.message}`)
      } else {
        console.log('✅ Logout completato')
      }
      
      setUser(null)
    } catch (error: any) {
      console.error('💥 Errore durante il logout:', error)
      setAuthError(`Errore di sistema: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = user?.ruolo === 'admin' || user?.ruolo === 'super_admin'
  const isSuperAdmin = user?.ruolo === 'super_admin'

  return {
    user,
    loading,
    signIn,
    signOut,
    isAdmin,
    isSuperAdmin,
    authError,
    clearAuthError: () => setAuthError(null)
  }
}