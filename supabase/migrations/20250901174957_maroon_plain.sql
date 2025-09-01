/*
  # Crea tabella certificazioni staff

  1. Nuova Tabella
    - `staff_certificazioni`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `nome_certificazione` (text, required)
      - `data_scadenza` (date, required)
      - `data_rilascio` (date, optional)
      - `ente_rilascio` (text, optional)
      - `numero_certificato` (text, optional)
      - `note` (text, optional)
      - `attiva` (boolean, default true)
      - `creato_il` (timestamptz)
      - `aggiornato_il` (timestamptz)

  2. Sicurezza
    - Enable RLS on `staff_certificazioni` table
    - Add policies for gym-based access control
    - Staff can view their own certifications
    - Admins can manage all certifications in their gym

  3. Indici
    - Index on user_id for performance
    - Index on data_scadenza for expiry queries
*/

-- Create staff_certificazioni table
CREATE TABLE IF NOT EXISTS staff_certificazioni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome_certificazione text NOT NULL,
  data_scadenza date NOT NULL,
  data_rilascio date,
  ente_rilascio text,
  numero_certificato text,
  note text,
  attiva boolean DEFAULT true,
  creato_il timestamptz DEFAULT now(),
  aggiornato_il timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE staff_certificazioni ENABLE ROW LEVEL SECURITY;

-- Create policies for staff_certificazioni
CREATE POLICY "Super admin full access to certifications"
  ON staff_certificazioni
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
  );

CREATE POLICY "Staff can view own certifications"
  ON staff_certificazioni
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff can update own certifications"
  ON staff_certificazioni
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin gym certifications access"
  ON staff_certificazioni
  FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT u.id 
      FROM users u
      JOIN users current_user ON current_user.id = auth.uid()
      WHERE current_user.ruolo IN ('admin', 'super_admin')
      AND (current_user.ruolo = 'super_admin' OR u.gym_id = current_user.gym_id)
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_certificazioni_user_id 
ON staff_certificazioni USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_staff_certificazioni_data_scadenza 
ON staff_certificazioni USING btree (data_scadenza);

CREATE INDEX IF NOT EXISTS idx_staff_certificazioni_attiva 
ON staff_certificazioni USING btree (attiva);

-- Add trigger to update aggiornato_il on updates
CREATE OR REPLACE FUNCTION update_aggiornato_il_staff_certificazioni()
RETURNS TRIGGER AS $$
BEGIN
  NEW.aggiornato_il = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_aggiornato_il_staff_certificazioni
  BEFORE UPDATE ON staff_certificazioni
  FOR EACH ROW
  EXECUTE FUNCTION update_aggiornato_il_staff_certificazioni();

-- Add comments for documentation
COMMENT ON TABLE staff_certificazioni IS 'Certificazioni e brevetti del personale con scadenze individuali';
COMMENT ON COLUMN staff_certificazioni.nome_certificazione IS 'Nome della certificazione o brevetto';
COMMENT ON COLUMN staff_certificazioni.data_scadenza IS 'Data di scadenza della certificazione';
COMMENT ON COLUMN staff_certificazioni.data_rilascio IS 'Data di rilascio della certificazione';
COMMENT ON COLUMN staff_certificazioni.ente_rilascio IS 'Ente o organizzazione che ha rilasciato la certificazione';
COMMENT ON COLUMN staff_certificazioni.numero_certificato IS 'Numero identificativo del certificato';
COMMENT ON COLUMN staff_certificazioni.attiva IS 'Indica se la certificazione è ancora valida/attiva';