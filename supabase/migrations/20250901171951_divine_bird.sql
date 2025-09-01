/*
  # Aggiungi campi dettagliati per lo staff

  1. Nuove Colonne per users
    - `titolo_studio` (text) - Titolo di studio conseguito
    - `diploma_brevetti` (text) - Diplomi o brevetti posseduti
    - `brevetti_scadenza` (date) - Data di scadenza dei brevetti
    - `paga_oraria` (decimal) - Paga oraria base
    - `modalita_pagamento` (text) - Modalità di pagamento (oraria, mensile, percentuale, forfait)
    - `partita_iva` (text) - Partita IVA per collaboratori esterni
    - `tipo_contratto` (text) - Tipologia contrattuale
    - `note_contrattuali` (text) - Note aggiuntive sul contratto

  2. Sicurezza
    - Nessuna modifica alle policy RLS esistenti
    - I nuovi campi seguono le stesse regole di accesso
*/

-- Aggiungi nuovi campi alla tabella users per dettagli staff
DO $$
BEGIN
  -- Titolo di studio
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'titolo_studio'
  ) THEN
    ALTER TABLE users ADD COLUMN titolo_studio text;
  END IF;

  -- Diplomi e brevetti
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'diploma_brevetti'
  ) THEN
    ALTER TABLE users ADD COLUMN diploma_brevetti text;
  END IF;

  -- Data scadenza brevetti
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'brevetti_scadenza'
  ) THEN
    ALTER TABLE users ADD COLUMN brevetti_scadenza date;
  END IF;

  -- Paga oraria
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'paga_oraria'
  ) THEN
    ALTER TABLE users ADD COLUMN paga_oraria decimal(10,2);
  END IF;

  -- Modalità di pagamento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'modalita_pagamento'
  ) THEN
    ALTER TABLE users ADD COLUMN modalita_pagamento text DEFAULT 'oraria';
  END IF;

  -- Partita IVA
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'partita_iva'
  ) THEN
    ALTER TABLE users ADD COLUMN partita_iva text;
  END IF;

  -- Tipo contratto
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'tipo_contratto'
  ) THEN
    ALTER TABLE users ADD COLUMN tipo_contratto text;
  END IF;

  -- Note contrattuali
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'note_contrattuali'
  ) THEN
    ALTER TABLE users ADD COLUMN note_contrattuali text;
  END IF;
END $$;

-- Aggiungi indici per performance sui campi più utilizzati
CREATE INDEX IF NOT EXISTS idx_users_tipo_contratto ON users(tipo_contratto);
CREATE INDEX IF NOT EXISTS idx_users_modalita_pagamento ON users(modalita_pagamento);
CREATE INDEX IF NOT EXISTS idx_users_brevetti_scadenza ON users(brevetti_scadenza);

-- Commento per documentare le nuove colonne
COMMENT ON COLUMN users.titolo_studio IS 'Titolo di studio conseguito dal membro dello staff';
COMMENT ON COLUMN users.diploma_brevetti IS 'Diplomi, certificazioni o brevetti posseduti';
COMMENT ON COLUMN users.brevetti_scadenza IS 'Data di scadenza dei brevetti o certificazioni';
COMMENT ON COLUMN users.paga_oraria IS 'Paga oraria base in euro';
COMMENT ON COLUMN users.modalita_pagamento IS 'Modalità di pagamento: oraria, mensile, percentuale, forfait';
COMMENT ON COLUMN users.partita_iva IS 'Partita IVA per collaboratori esterni';
COMMENT ON COLUMN users.tipo_contratto IS 'Tipologia contrattuale: dipendente, collaboratore, freelance, etc.';
COMMENT ON COLUMN users.note_contrattuali IS 'Note aggiuntive relative al contratto e condizioni di lavoro';