# 🏋️ GymManager - Sistema di Gestione Palestre

Un sistema completo e moderno per la gestione di palestre e centri fitness, sviluppato con React, TypeScript e Supabase.

![GymManager Dashboard](https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## 🚀 Caratteristiche Principali

### 📊 Dashboard Completa
- **Statistiche in tempo reale**: Iscritti attivi, ingressi giornalieri, ricavi mensili
- **Attività recenti**: Monitoraggio accessi, nuove iscrizioni, prenotazioni
- **Azioni rapide**: Accesso veloce alle funzioni più utilizzate
- **Pannello admin/super admin**: Controlli avanzati per amministratori

### 👥 Gestione Iscritti
- **Anagrafica completa**: Dati personali, contatti, certificati medici
- **Stati personalizzabili**: Attivo, scaduto, sospeso
- **Ricerca avanzata**: Filtri per nome, email, stato
- **Validazione dati**: Controlli automatici su email, telefono, codice fiscale

### 💳 Gestione Abbonamenti
- **Tipologie multiple**: Mensile, trimestrale, annuale, a crediti
- **Monitoraggio scadenze**: Notifiche automatiche per abbonamenti in scadenza
- **Gestione crediti**: Tracciamento utilizzo per abbonamenti a consumo
- **Rinnovi automatici**: Sistema di auto-rinnovo configurabile

### 📅 Sistema Prenotazioni
- **Calendario integrato**: Visualizzazione corsi e disponibilità
- **Gestione capacità**: Controllo posti disponibili per corso
- **Stati prenotazione**: Prenotato, presente, no-show, disdetto
- **Notifiche automatiche**: Promemoria e conferme

### 🏃‍♂️ Gestione Staff
- **Ruoli differenziati**: Super admin, admin, trainer, staff
- **Permessi granulari**: Accesso controllato alle funzionalità
- **Profili personalizzati**: Gestione dati e competenze staff

### 🏋️‍♀️ Gestione Attrezzature
- **Inventario completo**: Catalogazione attrezzature per area
- **Stati operativi**: Attiva, guasta, fuori uso, manutenzione
- **Manutenzioni programmate**: Calendario interventi e controlli
- **Storico interventi**: Tracciamento completo manutenzioni

### 📱 Sistema NFC/QR
- **Tag NFC**: Associazione tag a membri e attrezzature
- **Accessi automatici**: Controllo ingressi tramite NFC
- **Tracciamento utilizzo**: Log completo degli accessi
- **Gestione aree**: Controllo accessi per zone specifiche

### 🤖 Automazioni
- **Flussi personalizzabili**: Automazioni basate su eventi
- **Notifiche intelligenti**: Invio automatico comunicazioni
- **Integrazione N8N**: Workflow avanzati esterni
- **Trigger multipli**: Attivazione su vari eventi sistema

### 🔧 Manutenzioni
- **Pianificazione interventi**: Calendario manutenzioni preventive
- **Gestione tecnici**: Assegnazione e tracking interventi
- **Costi e materiali**: Tracciamento spese manutenzione
- **Storico completo**: Archivio interventi per attrezzatura

### 📈 Reports e Analytics
- **Dashboard analytics**: Grafici e metriche avanzate
- **Report personalizzabili**: Esportazione dati in vari formati
- **Analisi trend**: Andamenti iscrizioni, utilizzo, ricavi
- **KPI automatici**: Indicatori performance chiave

### 🔔 Centro Notifiche
- **Notifiche push**: Comunicazioni in tempo reale
- **Tipologie multiple**: Info, warning, success, error
- **Gestione destinatari**: Invio mirato per ruolo/gruppo
- **Storico messaggi**: Archivio comunicazioni inviate

## 🛠️ Stack Tecnologico

### Frontend
- **React 18** - Framework UI moderno
- **TypeScript** - Tipizzazione statica
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Libreria icone moderne
- **Vite** - Build tool veloce

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database relazionale
- **Row Level Security** - Sicurezza granulare
- **Real-time subscriptions** - Aggiornamenti live

### Autenticazione & Sicurezza
- **Supabase Auth** - Sistema autenticazione completo
- **JWT Tokens** - Autenticazione sicura
- **Role-based access** - Controllo accessi per ruolo
- **Email confirmation** - Verifica email automatica

## 🚀 Installazione e Setup

### Prerequisiti
- Node.js 18+ 
- npm o yarn
- Account Supabase

### Configurazione

1. Clona il repository

```bash
git clone https://github.com/tuousername/gestionale-palestre.git
cd gestionale-palestre
```

2. Installa le dipendenze

```bash
npm install
```

3. Configura le variabili d'ambiente

Crea un file `.env` nella root del progetto basandoti sul file `.env.example`:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=development
VITE_APP_NAME=GymManager
VITE_APP_VERSION=1.2.0
```

4. Avvia il server di sviluppo

```bash
npm run dev
```

5. Accedi all'applicazione

Apri il browser e vai a `http://localhost:5173`

### Configurazione di Supabase

1. Crea un nuovo progetto su [Supabase](https://supabase.com/)
2. Esegui le migrazioni SQL presenti nella cartella `supabase/migrations`
3. Copia l'URL del progetto e la chiave anonima nelle variabili d'ambiente

### Autenticazione

Per creare un utente di test, puoi utilizzare il pulsante "Crea Utente Test" nella pagina di login. Questo creerà un utente con le seguenti credenziali:

- Email: patrick.cioni@admin.com
- Password: admin123

### 1. Clone del Repository
```bash
git clone https://github.com/tuousername/gymmanager.git
cd gymmanager
```

### 2. Installazione Dipendenze
```bash
npm install
```

### 3. Configurazione Supabase
1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Copia le credenziali del progetto
3. Crea il file `.env` nella root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Database
Le migrazioni SQL sono nella cartella `supabase/migrations/`. Applicale nel tuo progetto Supabase:

1. Vai su Supabase Dashboard → SQL Editor
2. Esegui i file di migrazione in ordine cronologico
3. Verifica che tutte le tabelle siano create correttamente

### 5. Avvio Sviluppo
```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## 📋 Configurazione Iniziale

### Creazione Primo Utente Admin
1. Vai su Supabase Dashboard → Authentication → Users
2. Clicca "Add User"
3. Inserisci:
   - Email: `admin@tuapalestra.com`
   - Password: `password_sicura`
   - Conferma email automaticamente
4. Vai su Database → users table
5. Aggiungi record con:
   - `id`: UUID dell'utente creato
   - `nome`: Nome admin
   - `cognome`: Cognome admin  
   - `email`: Email utilizzata
   - `ruolo`: `super_admin`
   - `attivo`: `true`

### Configurazione Palestra
1. Crea le aree della palestra (sala pesi, cardio, corsi, etc.)
2. Aggiungi le attrezzature per ogni area
3. Configura i corsi disponibili
4. Imposta i tipi di abbonamento

## 🏗️ Struttura del Progetto

```
src/
├── components/           # Componenti React
│   ├── Auth/            # Autenticazione
│   ├── Dashboard/       # Dashboard principale
│   ├── Members/         # Gestione iscritti
│   ├── Subscriptions/   # Gestione abbonamenti
│   ├── Layout/          # Layout e navigazione
│   └── ...
├── hooks/               # Custom hooks
├── lib/                 # Configurazioni e utilities
├── utils/               # Funzioni di utilità
└── types/               # Definizioni TypeScript

supabase/
├── migrations/          # Migrazioni database SQL
└── functions/           # Edge functions (se utilizzate)
```

## 🔐 Sistema di Permessi

### Ruoli Utente
- **Super Admin**: Accesso completo a tutto il sistema
- **Admin**: Gestione palestra, iscritti, abbonamenti
- **Trainer**: Gestione corsi e prenotazioni
- **Staff**: Accesso base per reception

### Sicurezza Database
- **Row Level Security (RLS)** abilitata su tutte le tabelle
- **Policies** specifiche per ogni ruolo
- **Isolamento dati** per gym_id (multi-tenant ready)

## 🧪 Testing

### Test Utente Demo
Il sistema include un utente demo per testing:
- **Email**: `patrick.cioni@admin.com`
- **Password**: `admin123`
- **Ruolo**: Admin

### Dati di Test
Puoi popolare il database con dati di esempio per testing:
```sql
-- Inserisci membri di test
-- Inserisci abbonamenti di test  
-- Inserisci prenotazioni di test
```

## 🚀 Deployment

### Netlify (Consigliato)
1. Connetti il repository GitHub a Netlify
2. Configura le variabili d'ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automatico ad ogni push

### Vercel
1. Importa progetto da GitHub
2. Configura variabili d'ambiente
3. Deploy automatico

### Build Manuale
```bash
npm run build
```
I file di build saranno in `dist/`

## 🤝 Contribuire

### Processo di Contribuzione
1. Fork del repository
2. Crea branch feature (`git checkout -b feature/nuova-funzionalita`)
3. Commit delle modifiche (`git commit -m 'Aggiunge nuova funzionalità'`)
4. Push del branch (`git push origin feature/nuova-funzionalita`)
5. Apri Pull Request

### Linee Guida
- Segui le convenzioni TypeScript
- Aggiungi test per nuove funzionalità
- Documenta le API pubbliche
- Mantieni il codice pulito e commentato

### Segnalazione Bug
Usa GitHub Issues per segnalare bug, includendo:
- Descrizione dettagliata
- Passi per riprodurre
- Screenshot se applicabili
- Informazioni ambiente (browser, OS)

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 🆘 Supporto

### Documentazione
- [Wiki del Progetto](https://github.com/tuousername/gymmanager/wiki)
- [API Documentation](https://github.com/tuousername/gymmanager/docs/api)
- [FAQ](https://github.com/tuousername/gymmanager/wiki/FAQ)

### Community
- [Discord Server](https://discord.gg/gymmanager)
- [Forum Discussioni](https://github.com/tuousername/gymmanager/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/gymmanager)

### Contatti
- **Email**: support@gymmanager.dev
- **Twitter**: [@GymManagerDev](https://twitter.com/gymmanagerdev)
- **LinkedIn**: [GymManager](https://linkedin.com/company/gymmanager)

---

## 🌟 Roadmap

### v2.0 (Q2 2024)
- [ ] App mobile React Native
- [ ] Integrazione pagamenti Stripe
- [ ] Sistema loyalty points
- [ ] Chat integrata trainer-membri

### v2.1 (Q3 2024)
- [ ] AI per raccomandazioni workout
- [ ] Integrazione wearables (Fitbit, Apple Watch)
- [ ] Sistema prenotazione online pubblico
- [ ] Multi-lingua (EN, ES, FR, DE)

### v3.0 (Q4 2024)
- [ ] Marketplace corsi online
- [ ] Sistema franchising multi-sede
- [ ] Advanced analytics con ML
- [ ] Integrazione social media

---

**Sviluppato con ❤️ per la community fitness**

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)