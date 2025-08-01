# 📚 API Documentation

Documentazione completa delle API utilizzate in GymManager.

## 🏗️ Architettura

GymManager utilizza Supabase come backend, che fornisce:
- **Database PostgreSQL** con Row Level Security (RLS)
- **API REST** auto-generata
- **Real-time subscriptions** per aggiornamenti live
- **Autenticazione** JWT-based
- **Storage** per file e immagini

## 🔐 Autenticazione

### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

### Logout
```typescript
const { error } = await supabase.auth.signOut()
```

### Utente Corrente
```typescript
const { data: { user } } = await supabase.auth.getUser()
```

## 👥 Members API

### Recupera Tutti i Membri
```typescript
const { data, error } = await supabase
  .from('members')
  .select('*')
  .order('creato_il', { ascending: false })
```

### Crea Nuovo Membro
```typescript
const { data, error } = await supabase
  .from('members')
  .insert({
    nome: 'Mario',
    cognome: 'Rossi',
    email: 'mario.rossi@email.com',
    telefono: '+39 123 456 7890',
    stato: 'attivo',
    gym_id: 'uuid-palestra',
    creato_da: 'uuid-utente'
  })
  .select()
  .single()
```

### Aggiorna Membro
```typescript
const { data, error } = await supabase
  .from('members')
  .update({
    telefono: '+39 987 654 3210',
    stato: 'sospeso'
  })
  .eq('id', memberId)
  .select()
  .single()
```

### Elimina Membro
```typescript
const { error } = await supabase
  .from('members')
  .delete()
  .eq('id', memberId)
```

### Ricerca Membri
```typescript
const { data, error } = await supabase
  .from('members')
  .select('*')
  .or(`nome.ilike.%${searchTerm}%,cognome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
  .eq('stato', 'attivo')
```

## 💳 Subscriptions API

### Recupera Abbonamenti con Dati Membro
```typescript
const { data, error } = await supabase
  .from('subscriptions')
  .select(`
    *,
    member:members!inner(
      nome,
      cognome,
      email,
      stato
    )
  `)
  .order('creato_il', { ascending: false })
```

### Crea Nuovo Abbonamento
```typescript
const { data, error } = await supabase
  .from('subscriptions')
  .insert({
    member_id: 'uuid-membro',
    tipo: 'mensile',
    nome: 'Abbonamento Sala Pesi',
    data_inizio: '2024-01-01',
    data_fine: '2024-01-31',
    prezzo: 50.00,
    attivo: true,
    creato_da: 'uuid-utente'
  })
  .select()
  .single()
```

### Abbonamenti in Scadenza
```typescript
const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

const { data, error } = await supabase
  .from('subscriptions')
  .select('*, member:members(*)')
  .eq('attivo', true)
  .not('data_fine', 'is', null)
  .lte('data_fine', thirtyDaysFromNow)
  .gte('data_fine', new Date().toISOString())
```

## 📅 Bookings API

### Recupera Prenotazioni
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select(`
    *,
    member:members(nome, cognome),
    course:courses(nome, durata_minuti)
  `)
  .gte('data', startDate)
  .lte('data', endDate)
  .order('data', { ascending: true })
  .order('orario_inizio', { ascending: true })
```

### Crea Prenotazione
```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert({
    member_id: 'uuid-membro',
    course_id: 'uuid-corso',
    data: '2024-01-15',
    orario_inizio: '18:00',
    orario_fine: '19:00',
    stato: 'prenotato'
  })
  .select()
  .single()
```

### Aggiorna Stato Prenotazione
```typescript
const { data, error } = await supabase
  .from('bookings')
  .update({ stato: 'presente' })
  .eq('id', bookingId)
  .select()
  .single()
```

## 🏋️‍♀️ Equipment API

### Recupera Attrezzature per Area
```typescript
const { data, error } = await supabase
  .from('equipments')
  .select(`
    *,
    area:areas(nome)
  `)
  .eq('area_id', areaId)
  .order('nome', { ascending: true })
```

### Aggiorna Stato Attrezzatura
```typescript
const { data, error } = await supabase
  .from('equipments')
  .update({
    stato: 'manutenzione',
    note_manutenzione: 'Controllo programmato'
  })
  .eq('id', equipmentId)
  .select()
  .single()
```

## 📊 Analytics API

### Statistiche Dashboard
```typescript
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

// Ricavi mensili
const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
const { data: monthlyRevenue } = await supabase
  .from('subscriptions')
  .select('prezzo')
  .eq('attivo', true)
  .gte('creato_il', startOfMonth)
```

### Trend Iscrizioni
```typescript
const { data, error } = await supabase
  .from('members')
  .select('creato_il')
  .gte('creato_il', startDate)
  .lte('creato_il', endDate)
  .order('creato_il', { ascending: true })
```

## 🔔 Notifications API

### Recupera Notifiche Utente
```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('destinatario_id', userId)
  .order('creato_il', { ascending: false })
  .limit(50)
```

### Crea Notifica
```typescript
const { data, error } = await supabase
  .from('notifications')
  .insert({
    destinatario_id: 'uuid-utente',
    titolo: 'Abbonamento in scadenza',
    messaggio: 'Il tuo abbonamento scade tra 7 giorni',
    tipo: 'warning',
    azione_url: '/subscriptions'
  })
  .select()
  .single()
```

### Marca Notifica come Letta
```typescript
const { data, error } = await supabase
  .from('notifications')
  .update({ letta: true })
  .eq('id', notificationId)
  .select()
  .single()
```

## 🔄 Real-time Subscriptions

### Ascolta Nuovi Membri
```typescript
const subscription = supabase
  .channel('members-changes')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'members' 
    }, 
    (payload) => {
      console.log('Nuovo membro:', payload.new)
      // Aggiorna UI
    }
  )
  .subscribe()

// Cleanup
subscription.unsubscribe()
```

### Ascolta Aggiornamenti Prenotazioni
```typescript
const subscription = supabase
  .channel('bookings-changes')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookings'
    },
    (payload) => {
      console.log('Prenotazione aggiornata:', payload)
      // Ricarica calendario
    }
  )
  .subscribe()
```

## 🔒 Row Level Security (RLS)

### Policy Esempi

#### Members - Solo Gym Specifica
```sql
CREATE POLICY "Members gym access" ON members
FOR ALL USING (
  auth.jwt() ->> 'user_metadata'->>'role' = 'super_admin' 
  OR 
  gym_id IN (
    SELECT u.gym_id FROM users u 
    WHERE u.id = auth.uid() 
    AND u.ruolo IN ('admin', 'trainer', 'staff')
  )
);
```

#### Users - Profilo Proprio
```sql
CREATE POLICY "Users can read own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);
```

## 📝 Tipi TypeScript

### Interfacce Principali
```typescript
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

export interface Booking {
  id: string
  member_id: string
  course_id: string
  data: string
  orario_inizio: string
  orario_fine?: string
  stato: BookingStatus
  note?: string
  creato_il: string
}
```

### Enum Types
```typescript
export type UserRole = 'super_admin' | 'admin' | 'trainer' | 'staff'
export type MemberStatus = 'attivo' | 'scaduto' | 'sospeso'
export type SubscriptionType = 'mensile' | 'trimestrale' | 'annuale' | 'a_crediti'
export type BookingStatus = 'prenotato' | 'presente' | 'no_show' | 'disdetto'
export type EquipmentStatus = 'attiva' | 'guasta' | 'fuori_uso' | 'manutenzione'
export type NotificationType = 'info' | 'warning' | 'success' | 'error'
```

## ⚠️ Gestione Errori

### Pattern Comune
```typescript
try {
  const { data, error } = await supabase
    .from('members')
    .insert(memberData)
    .select()
    .single()

  if (error) throw error
  
  return { success: true, data }
} catch (error: any) {
  console.error('Error creating member:', error)
  return { 
    success: false, 
    error: error.message || 'Errore durante la creazione' 
  }
}
```

### Errori Comuni
- `23505` - Violazione unique constraint
- `23503` - Violazione foreign key
- `42501` - Permessi insufficienti (RLS)
- `22P02` - Formato UUID non valido

## 🚀 Performance Tips

### Ottimizzazioni Query
```typescript
// ✅ Buono - Select solo campi necessari
const { data } = await supabase
  .from('members')
  .select('id, nome, cognome, stato')
  .eq('stato', 'attivo')

// ❌ Evita - Select *
const { data } = await supabase
  .from('members')
  .select('*')
```

### Paginazione
```typescript
const { data, error } = await supabase
  .from('members')
  .select('*')
  .range(0, 49) // Prime 50 righe
  .order('creato_il', { ascending: false })
```

### Indici Database
```sql
-- Indici per performance
CREATE INDEX idx_members_stato ON members(stato);
CREATE INDEX idx_members_gym_id ON members(gym_id);
CREATE INDEX idx_subscriptions_member_id ON subscriptions(member_id);
CREATE INDEX idx_bookings_data ON bookings(data);
```

---

Per esempi più dettagliati e casi d'uso specifici, consulta la [documentazione Supabase](https://supabase.com/docs).