/*
  # Crea utente admin test - Patrick Cioni

  1. Nuovo Utente
    - Nome: Patrick Cioni
    - Email: patrick.cioni@admin.com
    - Ruolo: admin
    - Password: admin123 (da impostare manualmente in Supabase Auth)

  2. Note
    - L'utente deve essere creato anche in Supabase Auth Dashboard
    - Questo script crea solo il record nella tabella users
    - La password deve essere impostata manualmente
*/

-- Inserisci utente admin Patrick Cioni
INSERT INTO users (
  id,
  nome,
  cognome,
  email,
  ruolo,
  attivo,
  creato_il,
  aggiornato_il
) VALUES (
  gen_random_uuid(),
  'Patrick',
  'Cioni',
  'patrick.cioni@admin.com',
  'admin',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  cognome = EXCLUDED.cognome,
  ruolo = EXCLUDED.ruolo,
  attivo = EXCLUDED.attivo,
  aggiornato_il = now();

-- Verifica che l'utente sia stato creato
SELECT 
  nome,
  cognome,
  email,
  ruolo,
  attivo,
  creato_il
FROM users 
WHERE email = 'patrick.cioni@admin.com';