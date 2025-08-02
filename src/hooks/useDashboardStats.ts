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

      // Iscritti attivi
      const { count: activeMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('stato', 'attivo')

      // Ingressi oggi
      const today = new Date().toISOString().split('T')[0]
      const { count: todayAccess } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp_ingresso', `${today}T00:00:00`)
        .lt('timestamp_ingresso', `${today}T23:59:59`)

      // Prenotazioni oggi
      const { count: todayBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('data', today)
        .eq('stato', 'prenotato')

      // Ricavi mensili
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { data: monthlySubscriptions } = await supabase
        .from('subscriptions')
        .select('product:subscription_products!fk_product_id(price)')
        .eq('attivo', true)
        .gte('creato_il', startOfMonth)

      const monthlyRevenue = monthlySubscriptions?.reduce((sum, sub) => sum + (sub.product?.price || 0), 0) || 0

      setStats({
        activeMembers: activeMembers || 0,
        todayAccess: todayAccess || 0,
        todayBookings: todayBookings || 0,
        monthlyRevenue,
        membersChange: activeMembers ? `${activeMembers} totali` : 'Nessun iscritto',
        membersChangeType: 'neutral',
        accessChange: todayAccess ? `${todayAccess} ingressi` : 'Nessun ingresso',
        accessChangeType: 'neutral',
        revenueChange: monthlyRevenue ? `${monthlyRevenue > 0 ? '+' : ''}€${monthlyRevenue}` : 'Nessun ricavo',
        revenueChangeType: monthlyRevenue > 0 ? 'positive' : 'neutral'
      })

    } catch (error) {
      console.error('Errore nel recupero statistiche:', error)
      // Mantieni i valori di default in caso di errore
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, refetch: fetchStats }
}