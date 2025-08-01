# 🤝 Guida alla Contribuzione

Grazie per il tuo interesse nel contribuire a GymManager! Questa guida ti aiuterà a iniziare.

## 📋 Indice
- [Codice di Condotta](#codice-di-condotta)
- [Come Contribuire](#come-contribuire)
- [Setup Ambiente di Sviluppo](#setup-ambiente-di-sviluppo)
- [Linee Guida per il Codice](#linee-guida-per-il-codice)
- [Processo di Review](#processo-di-review)
- [Segnalazione Bug](#segnalazione-bug)
- [Richiesta Funzionalità](#richiesta-funzionalità)

## 📜 Codice di Condotta

Questo progetto aderisce al [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Partecipando, ti impegni a rispettare questo codice.

## 🚀 Come Contribuire

### 1. Fork del Repository
```bash
# Clona il tuo fork
git clone https://github.com/tuousername/gymmanager.git
cd gymmanager

# Aggiungi il repository originale come remote
git remote add upstream https://github.com/originalowner/gymmanager.git
```

### 2. Crea un Branch
```bash
# Crea e passa a un nuovo branch
git checkout -b feature/nome-funzionalita
# oppure
git checkout -b fix/nome-bug
# oppure  
git checkout -b docs/aggiornamento-documentazione
```

### 3. Fai le Modifiche
- Scrivi codice pulito e ben documentato
- Aggiungi test per nuove funzionalità
- Assicurati che tutti i test passino
- Segui le linee guida di stile

### 4. Commit delle Modifiche
```bash
# Aggiungi i file modificati
git add .

# Commit con messaggio descrittivo
git commit -m "feat: aggiunge gestione automatica scadenze abbonamenti"
```

#### Convenzioni Commit
Usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nuova funzionalità
- `fix:` correzione bug
- `docs:` aggiornamenti documentazione
- `style:` modifiche formattazione
- `refactor:` refactoring codice
- `test:` aggiunta/modifica test
- `chore:` task di manutenzione

### 5. Push e Pull Request
```bash
# Push del branch
git push origin feature/nome-funzionalita

# Crea Pull Request su GitHub
```

## 🛠️ Setup Ambiente di Sviluppo

### Prerequisiti
- Node.js 18+
- npm o yarn
- Git
- Account Supabase (per testing)

### Installazione
```bash
# Installa dipendenze
npm install

# Copia file ambiente
cp .env.example .env

# Configura variabili Supabase nel .env
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key

# Avvia server sviluppo
npm run dev
```

### Database Setup
1. Crea progetto Supabase
2. Esegui migrazioni in `supabase/migrations/`
3. Configura RLS policies
4. Crea utente test admin

## 📝 Linee Guida per il Codice

### TypeScript
- Usa tipizzazione forte
- Evita `any`, preferisci `unknown`
- Definisci interfacce per oggetti complessi
- Usa enum per valori costanti

```typescript
// ✅ Buono
interface Member {
  id: string
  nome: string
  cognome: string
  stato: MemberStatus
}

// ❌ Evita
const member: any = { ... }
```

### React Components
- Usa functional components con hooks
- Preferisci composizione a ereditarietà
- Mantieni componenti piccoli e focalizzati
- Usa TypeScript per props

```typescript
// ✅ Buono
interface MemberCardProps {
  member: Member
  onEdit: (id: string) => void
}

export function MemberCard({ member, onEdit }: MemberCardProps) {
  // ...
}
```

### Styling
- Usa Tailwind CSS
- Mantieni classi ordinate
- Usa variabili CSS per valori ripetuti
- Responsive design first

```typescript
// ✅ Buono
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">

// ❌ Evita stili inline
<div style={{ backgroundColor: 'white', padding: '24px' }}>
```

### File Organization
- Un componente per file
- Raggruppa file correlati in cartelle
- Usa nomi descrittivi
- Mantieni struttura consistente

```
src/
├── components/
│   ├── Members/
│   │   ├── MemberCard.tsx
│   │   ├── MembersList.tsx
│   │   └── NewMemberModal.tsx
│   └── ...
```

### Gestione Stato
- Usa useState per stato locale
- Usa useEffect per side effects
- Considera Context per stato globale
- Evita prop drilling eccessivo

### Error Handling
- Gestisci sempre gli errori
- Mostra messaggi utente-friendly
- Log errori per debugging
- Usa try-catch per async operations

```typescript
// ✅ Buono
try {
  const { data, error } = await supabase.from('members').insert(member)
  if (error) throw error
  setMembers(prev => [...prev, data])
} catch (error) {
  console.error('Error creating member:', error)
  setError('Errore durante la creazione del membro')
}
```

## 🔍 Processo di Review

### Checklist Pull Request
- [ ] Codice compila senza errori
- [ ] Test passano tutti
- [ ] Documentazione aggiornata
- [ ] Nessun console.log dimenticato
- [ ] Variabili e funzioni ben nominate
- [ ] Gestione errori implementata
- [ ] Responsive design testato
- [ ] Accessibilità considerata

### Review Process
1. **Automated Checks**: CI/CD verifica build e test
2. **Code Review**: Maintainer revisionano il codice
3. **Testing**: Funzionalità testata in ambiente staging
4. **Approval**: PR approvata e merged

### Feedback
- Sii costruttivo nei commenti
- Spiega il "perché" delle modifiche richieste
- Suggerisci alternative quando possibile
- Riconosci il buon lavoro

## 🐛 Segnalazione Bug

### Prima di Segnalare
1. Cerca issue esistenti
2. Verifica con ultima versione
3. Testa in ambiente pulito
4. Raccogli informazioni debug

### Template Bug Report
```markdown
**Descrizione Bug**
Descrizione chiara e concisa del bug.

**Passi per Riprodurre**
1. Vai a '...'
2. Clicca su '...'
3. Scorri fino a '...'
4. Vedi errore

**Comportamento Atteso**
Cosa dovrebbe succedere.

**Comportamento Attuale**
Cosa succede invece.

**Screenshots**
Se applicabili, aggiungi screenshot.

**Ambiente**
- OS: [es. iOS, Windows, Linux]
- Browser: [es. Chrome, Safari, Firefox]
- Versione: [es. 22]
- Dispositivo: [es. iPhone6, Desktop]

**Informazioni Aggiuntive**
Qualsiasi altro contesto sul problema.
```

## 💡 Richiesta Funzionalità

### Template Feature Request
```markdown
**La tua richiesta è correlata a un problema?**
Descrizione chiara del problema. Es. Sono sempre frustrato quando [...]

**Descrivi la soluzione che vorresti**
Descrizione chiara di cosa vorresti che succedesse.

**Descrivi alternative considerate**
Descrizione di soluzioni alternative considerate.

**Contesto Aggiuntivo**
Qualsiasi altro contesto o screenshot sulla richiesta.
```

## 🏷️ Labels e Priorità

### Labels Issue
- `bug` - Qualcosa non funziona
- `enhancement` - Nuova funzionalità o richiesta
- `documentation` - Miglioramenti documentazione
- `good first issue` - Buono per newcomers
- `help wanted` - Aiuto extra benvenuto
- `question` - Richiesta informazioni

### Priorità
- `priority: high` - Critico, da risolvere subito
- `priority: medium` - Importante, prossimo sprint
- `priority: low` - Nice to have, quando possibile

## 🎯 Aree di Contribuzione

### Frontend
- Nuovi componenti UI
- Miglioramenti UX
- Responsive design
- Accessibilità
- Performance optimization

### Backend/Database
- Nuove API endpoints
- Ottimizzazioni query
- Migrazioni database
- Sicurezza RLS

### Documentazione
- Guide utente
- Documentazione API
- Tutorial
- Esempi codice

### Testing
- Unit tests
- Integration tests
- E2E tests
- Performance tests

### DevOps
- CI/CD improvements
- Docker configuration
- Deployment scripts
- Monitoring setup

## 🏆 Riconoscimenti

I contributori vengono riconosciuti in:
- README.md contributors section
- Release notes
- Hall of Fame
- LinkedIn recommendations (su richiesta)

## 📞 Supporto

Hai domande? Contattaci:
- **Discord**: [Server Community](https://discord.gg/gymmanager)
- **Email**: contributors@gymmanager.dev
- **GitHub Discussions**: [Discussioni](https://github.com/tuousername/gymmanager/discussions)

---

**Grazie per contribuire a GymManager! 🙏**