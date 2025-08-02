import { useState, useEffect } from 'react'
import { supabase, User } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    console.log('useAuth useEffect: Inizio esecuzione.')
    
    // Controlla la sessione corrente
    const checkSession = async () => {
      console.log('checkSession: Inizio. loading:', loading)
      try {
        setLoading(true)
        setAuthError(null)
        
        // Ottieni la sessione corrente
        const { data: { session } } = await supabase.auth.getSession()
        console.log('checkSession: Sessione ottenuta. sessione:', session ? 'presente' : 'assente')
        
        if (session) {
          // Ottieni i dati dell'utente dal database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle()
            
          if (userError) {
            console.error('Errore nel recupero dati utente:', userError)
            setUser(null)
            setAuthError(`Errore nel recupero dati utente: ${userError.message}`)
            await supabase.auth.signOut()
          } else if (!userData) {
            // L'utente è autenticato ma non esiste nel database
            console.warn('Utente autenticato ma non trovato nel database. Effettuo logout automatico.')
            setUser(null)
            setAuthError('Il tuo account non è stato trovato nel sistema. Contatta l\'amministratore per completare la configurazione del profilo.')
            await supabase.auth.signOut()
          } else {
            setUser(userData as User)
            console.log('checkSession: Utente impostato:', userData.email)
          }
        } else {
          setUser(null)
          console.log('checkSession: Nessuna sessione, utente impostato a null.')
        }
      } catch (error: any) {
        console.error('Errore nel controllo della sessione:', error)
        setUser(null)
        setAuthError(`Errore di sistema: ${error.message}`)
      } finally {
        setLoading(false)
        console.log('checkSession: Fine. loading impostato a false.')
      }
    }
    
    checkSession()
    
    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('onAuthStateChange: Evento:', event, 'loading:', loading)
      setLoading(true)
      setAuthError(null)
      
      if (event === 'SIGNED_IN' && session) {
        try {
          // Ottieni i dati dell'utente dal database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle()
            
          if (userError) {
            console.error('Errore nel recupero dati utente:', userError)
            setUser(null)
            setAuthError(`Errore nel recupero dati utente: ${userError.message}`)
            await supabase.auth.signOut()
          } else if (!userData) {
            // L'utente è autenticato ma non esiste nel database
            console.warn('Utente autenticato ma non trovato nel database. Effettuo logout automatico.')
            setUser(null)
            setAuthError('Il tuo account non è stato trovato nel sistema. Contatta l\'amministratore per completare la configurazione del profilo.')
            await supabase.auth.signOut()
          } else {
            setUser(userData as User)
            
            // Aggiorna l'ultimo accesso
            await supabase
              .from('users')
              .update({ ultimo_accesso: new Date().toISOString() })
              .eq('id', userData.id)
          }
        } catch (error: any) {
          console.error('Errore durante il processo di login:', error)
          setAuthError(`Errore di sistema: ${error.message}`)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        console.log('onAuthStateChange: Utente disconnesso.')
      }
      
      setLoading(false)
      console.log('onAuthStateChange: Fine. loading impostato a false.')
    })
    
    // Pulizia della sottoscrizione
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Errore di login:', error)
        setAuthError(`Errore di login: ${error.message}`)
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('Errore durante il login:', error)
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
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Errore durante il logout:', error)
        setAuthError(`Errore durante il logout: ${error.message}`)
      }
      
      setUser(null)
    } catch (error: any) {
      console.error('Errore durante il logout:', error)
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