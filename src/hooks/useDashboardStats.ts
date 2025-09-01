import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface DashboardStats {
  activeMembers: number
  todayAccess: number
  todayBookings: number
  monthlyRevenue: number
  membersChange: string
  membersChangeType: 'positive' | 'negative' | 'neutral'
  accessChange: string
  accessChangeType: 'positive' | 'negative' | 'neutral'
  revenueChange: string
  revenueChangeType: 'positive' | 'negative' | 'neutral'
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    activeMembers: 0,
    todayAccess: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    membersChange: '',
    membersChangeType: 'neutral',
    accessChange: '',
    accessChangeType: 'neutral',
    revenueChange: '',
    revenueChangeType: 'neutral'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // Log dello stato di autenticazione prima delle query
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('🔍 Stato sessione prima delle query dashboard:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        sessionError: sessionError?.message
      })

      if (sessionError) {
        console.error('❌ Errore sessione dashboard:', sessionError)
        throw new Error(`Errore sessione: ${sessionError.message}`)
      }

      if (!session) {
        console.warn('⚠️ Nessuna sessione attiva per le query dashboard')
        throw new Error('Utente non autenticato')
      }

      let activeMembers = 0
      let todayAccess = 0
      let todayBookings = 0
      let monthlyRevenue = 0

      // Query 1: Iscritti attivi
      try {
        console.log('📡 Eseguendo query members (dashboard)...')
        const membersResult = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('stato', 'attivo')

        if (membersResult.error) {
          console.error('❌ Errore query members (dashboard):', {
            message: membersResult.error.message,
            details: membersResult.error.details,
            hint: membersResult.error.hint,
            code: membersResult.error.code
          })
          throw membersResult.error
        }
        activeMembers = membersResult.count || 0
        console.log('✅ Query members completata:', { count: activeMembers })
      } catch (error: any) {
        console.error('💥 Errore members (dashboard):', {
          name: error.name,
          message: error.message,
          isAborted: error.name === 'AbortError' || error.message.includes('aborted')
        })
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          console.error('🛑 Query members interrotta (ERR_ABORTED)')
        }
      }

      // Query 2: Ingressi oggi
      try {
        const today = new Date().toISOString().split('T')[0]
        console.log('📡 Eseguendo query access_logs (dashboard)...')
        const accessResult = await supabase
          .from('access_logs')
          .select('*', { count: 'exact', head: true })
          .gte('timestamp_ingresso', `${today}T00:00:00`)
          .lt('timestamp_ingresso', `${today}T23:59:59`)

        if (accessResult.error) {
          console.error('❌ Errore query access_logs (dashboard):', {
            message: accessResult.error.message,
            details: accessResult.error.details,
            hint: accessResult.error.hint,
            code: accessResult.error.code
          })
          throw accessResult.error
        }
        todayAccess = accessResult.count || 0
        console.log('✅ Query access_logs completata:', { count: todayAccess })
      } catch (error: any) {
        console.error('💥 Errore access_logs (dashboard):', {
          name: error.name,
          message: error.message,
          isAborted: error.name === 'AbortError' || error.message.includes('aborted')
        })
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          console.error('🛑 Query access_logs interrotta (ERR_ABORTED)')
        }
      }

      // Query 3: Prenotazioni oggi
      try {
        const today = new Date().toISOString().split('T')[0]
        console.log('📡 Eseguendo query bookings (dashboard)...')
        const bookingsResult = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('data', today)
          .eq('stato', 'prenotato')

        if (bookingsResult.error) {
          console.error('❌ Errore query bookings (dashboard):', {
            message: bookingsResult.error.message,
            details: bookingsResult.error.details,
            hint: bookingsResult.error.hint,
            code: bookingsResult.error.code
          })
          throw bookingsResult.error
        }
        todayBookings = bookingsResult.count || 0
        console.log('✅ Query bookings completata:', { count: todayBookings })
      } catch (error: any) {
        console.error('💥 Errore bookings (dashboard):', {
          name: error.name,
          message: error.message,
          isAborted: error.name === 'AbortError' || error.message.includes('aborted')
        })
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          console.error('🛑 Query bookings interrotta (ERR_ABORTED)')
        }
      }

      // Query 4: Ricavi mensili
      try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        console.log('📡 Eseguendo query subscriptions (dashboard)...')
        const subscriptionsResult = await supabase
          .from('subscriptions')
          .select('product:subscription_products!fk_subscriptions_product_id(price)')
          .eq('attivo', true)
          .gte('creato_il', startOfMonth)

        if (subscriptionsResult.error) {
          console.error('❌ Errore query subscriptions (dashboard):', {
            message: subscriptionsResult.error.message,
            details: subscriptionsResult.error.details,
            hint: subscriptionsResult.error.hint,
            code: subscriptionsResult.error.code
          })
          throw subscriptionsResult.error
        }
        monthlyRevenue = subscriptionsResult.data?.reduce((sum, sub) => sum + (sub.product?.price || 0), 0) || 0
        console.log('✅ Query subscriptions completata:', { revenue: monthlyRevenue })
      } catch (error: any) {
        console.error('💥 Errore subscriptions (dashboard):', {
          name: error.name,
          message: error.message,
          isAborted: error.name === 'AbortError' || error.message.includes('aborted')
        })
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          console.error('🛑 Query subscriptions interrotta (ERR_ABORTED)')
        }
      }

      console.log('📊 Riepilogo statistiche dashboard:', {
        activeMembers,
        todayAccess,
        todayBookings,
        monthlyRevenue
      })

      setStats({
        activeMembers,
        todayAccess,
        todayBookings,
        monthlyRevenue,
        membersChange: activeMembers ? `${activeMembers} totali` : 'Nessun iscritto',
        membersChange: activeMembers ? `${activeMembers} totali` : 'Nessuna anagrafica',
        membersChangeType: 'neutral',
        accessChange: todayAccess ? `${todayAccess} ingressi` : 'Nessun ingresso',
        accessChangeType: 'neutral',
        revenueChange: monthlyRevenue ? `${monthlyRevenue > 0 ? '+' : ''}€${monthlyRevenue}` : 'Nessun ricavo',
        revenueChangeType: monthlyRevenue > 0 ? 'positive' : 'neutral'
      })

    } catch (error: any) {
      console.error('💥 Errore generale fetchStats (dashboard):', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      })
      
      // Verifica se è un errore di rete (ERR_ABORTED)
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        console.error('🛑 Richieste dashboard interrotte (ERR_ABORTED) - possibile problema di autenticazione o RLS')
      }
      
      // Mantieni i valori di default in caso di errore
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, refetch: fetchStats }
}