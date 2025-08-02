import { supabase, User } from '../lib/supabase'

// Verifica se Supabase è configurato correttamente
const isSupabaseConfigured = 
  supabase.supabaseUrl !== 'https://your-supabase-project-url.supabase.co' && 
  supabase.supabaseKey !== 'your-supabase-anon-key'

// Utente di fallback per modalità demo
const DEMO_USER: User = {
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

export async function createTestUser() {
  try {
    console.log('🔄 Tentativo di creazione utente test...')
    
    // Se Supabase non è configurato, restituisci l'utente demo
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configurato. Impossibile creare un utente reale.')
      console.warn('⚠️ Restituisco un utente demo fittizio.')
      return { success: true, user: DEMO_USER }
    }
    
    // Verifica se l'utente esiste già
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'patrick.cioni@admin.com')
      .single()
    
    if (!checkError && existingUser) {
      console.log('✅ Utente test già esistente, non è necessario crearlo di nuovo')
      return { success: true, user: existingUser }
    }
    
    // Utilizziamo il metodo signInWithPassword invece di signUp
    // Questo ci permette di accedere con l'utente già creato nelle migrazioni
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'patrick.cioni@admin.com',
      password: 'admin123'
    })

    if (authError) {
      console.error('❌ Accesso utente test fallito:', authError)
      return { success: false, error: authError.message }
    }
    
    if (!authData.user) {
      return { success: false, error: 'Nessun utente trovato' }
    }

    console.log('✅ Accesso effettuato come utente test:', authData.user.id)
    
    // Recupera i dati dell'utente dal database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'patrick.cioni@admin.com')
      .single()
    
    if (userError) {
      console.error('❌ Errore nel recupero dati utente:', userError)
      return { success: false, error: userError.message }
    }
    
    console.log('✅ Dati utente test recuperati con successo')
    console.log('⚠️ In un ambiente di produzione, dovresti utilizzare un endpoint API sicuro per creare utenti admin')
    
    // Restituisci l'utente recuperato dal database
    return { success: true, user: userData }

  } catch (error: any) {
    console.error('❌ Errore nella creazione utente test:', error)
    return { success: false, error: error.message }
  }
}