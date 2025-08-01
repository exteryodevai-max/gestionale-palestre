import { supabase } from '../lib/supabase'

export async function createTestUser() {
  try {
    console.log('🔄 Creating test user Patrick Cioni...')
    
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'patrick.cioni@admin.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        nome: 'Patrick',
        cognome: 'Cioni',
        role: 'admin'
      }
    })

    if (authError) {
      console.error('❌ Auth user creation failed:', authError)
      return { success: false, error: authError.message }
    }

    console.log('✅ Auth user created:', authData.user?.id)

    // 2. Create user profile in users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user!.id,
        nome: 'Patrick',
        cognome: 'Cioni',
        email: 'patrick.cioni@admin.com',
        ruolo: 'admin',
        attivo: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError)
      return { success: false, error: profileError.message }
    }

    console.log('✅ User profile created successfully!')
    return { success: true, user: profileData }

  } catch (error: any) {
    console.error('❌ Error creating test user:', error)
    return { success: false, error: error.message }
  }
}