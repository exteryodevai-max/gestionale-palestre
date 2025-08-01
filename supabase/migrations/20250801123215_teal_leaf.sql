/*
  # Schema Gestionale Palestre

  ## Nuove Tabelle
  1. **users** - Staff e amministratori del sistema
  2. **members** - Iscritti alle palestre
  3. **areas** - Aree/sale delle palestre
  4. **subscriptions** - Abbonamenti e pacchetti
  5. **courses** - Corsi disponibili
  6. **bookings** - Prenotazioni
  7. **nfc_tags** - Tag NFC per accessi e attrezzature
  8. **equipments** - Attrezzature
  9. **automations** - Workflow automatizzati
  10. **access_logs** - Log degli accessi
  11. **maintenance_logs** - Log manutenzioni
  12. **notifications** - Sistema notifiche

  ## Sicurezza
  - RLS abilitato su tutte le tabelle
  - Policies per super_admin e admin
  - Audit trail per modifiche critiche
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'trainer', 'staff');
CREATE TYPE member_status AS ENUM ('attivo', 'scaduto', 'sospeso');
CREATE TYPE subscription_type AS ENUM ('mensile', 'trimestrale', 'annuale', 'a_crediti');
CREATE TYPE booking_status AS ENUM ('prenotato', 'presente', 'no_show', 'disdetto');
CREATE TYPE nfc_tag_type AS ENUM ('ingresso', 'attrezzatura', 'area');
CREATE TYPE equipment_status AS ENUM ('attiva', 'guasta', 'fuori_uso', 'manutenzione');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');

-- Users table (staff and admins)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cognome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefono text,
  ruolo user_role NOT NULL DEFAULT 'staff',
  password_hash text,
  attivo boolean DEFAULT true,
  gym_id uuid, -- Per multi-gym setup
  avatar_url text,
  ultimo_accesso timestamptz,
  creato_il timestamptz DEFAULT now(),
  aggiornato_il timestamptz DEFAULT now()
);

-- Areas table (gym areas/rooms)
CREATE TABLE IF NOT EXISTS areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descrizione text,
  capacita_max integer DEFAULT 0,
  gym_id uuid,
  attiva boolean DEFAULT true,
  immagine_url text,
  creato_il timestamptz DEFAULT now()
);

-- Members table (gym members)
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cognome text NOT NULL,
  email text,
  telefono text,
  data_nascita date,
  codice_fiscale text,
  indirizzo text,
  certificato_valido_fino date,
  stato member_status DEFAULT 'attivo',
  tag_nfc_id uuid,
  note text,
  foto_url text,
  gym_id uuid,
  creato_da uuid REFERENCES users(id),
  creato_il timestamptz DEFAULT now(),
  aggiornato_il timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  tipo subscription_type NOT NULL,
  nome text NOT NULL,
  data_inizio date NOT NULL,
  data_fine date,
  crediti_totali integer DEFAULT 0,
  crediti_usati integer DEFAULT 0,
  prezzo decimal(10,2),
  rinnovo_automatico boolean DEFAULT false,
  attivo boolean DEFAULT true,
  creato_da uuid REFERENCES users(id),
  creato_il timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descrizione text,
  area_id uuid REFERENCES areas(id),
  trainer_id uuid REFERENCES users(id),
  capacita integer DEFAULT 1,
  durata_minuti integer DEFAULT 60,
  prezzo decimal(10,2),
  visibile boolean DEFAULT true,
  colore text DEFAULT '#3B82F6',
  gym_id uuid,
  creato_il timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id),
  data date NOT NULL,
  orario_inizio time NOT NULL,
  orario_fine time,
  stato booking_status DEFAULT 'prenotato',
  note text,
  creato_il timestamptz DEFAULT now(),
  aggiornato_il timestamptz DEFAULT now()
);

-- NFC Tags table
CREATE TABLE IF NOT EXISTS nfc_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codice_univoco text UNIQUE NOT NULL,
  tipo nfc_tag_type NOT NULL,
  assegnato_a uuid, -- Generic FK (can be equipment_id, area_id, etc.)
  assegnato_tipo text, -- 'equipment', 'area', 'member'
  attivo boolean DEFAULT true,
  ultimo_utilizzo timestamptz,
  gym_id uuid,
  creato_il timestamptz DEFAULT now()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descrizione text,
  area_id uuid REFERENCES areas(id),
  stato equipment_status DEFAULT 'attiva',
  tag_nfc_id uuid REFERENCES nfc_tags(id),
  codice_seriale text,
  data_acquisto date,
  ultima_manutenzione date,
  prossima_manutenzione date,
  note_manutenzione text,
  gym_id uuid,
  creato_il timestamptz DEFAULT now()
);

-- Access logs table
CREATE TABLE IF NOT EXISTS access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id),
  area_id uuid REFERENCES areas(id),
  equipment_id uuid REFERENCES equipments(id),
  nfc_tag_id uuid REFERENCES nfc_tags(id),
  tipo_accesso text NOT NULL, -- 'ingresso', 'utilizzo_attrezzo', 'corso'
  timestamp_ingresso timestamptz DEFAULT now(),
  timestamp_uscita timestamptz,
  durata_minuti integer,
  gym_id uuid
);

-- Maintenance logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES equipments(id) ON DELETE CASCADE,
  tipo text NOT NULL, -- 'preventiva', 'correttiva', 'straordinaria'
  descrizione text NOT NULL,
  costo decimal(10,2),
  tecnico text,
  data_intervento date NOT NULL,
  durata_ore decimal(4,2),
  materiali_utilizzati text,
  prossima_manutenzione date,
  creato_da uuid REFERENCES users(id),
  creato_il timestamptz DEFAULT now()
);

-- Automations table
CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descrizione text,
  trigger_event text NOT NULL,
  condizioni jsonb,
  azioni jsonb,
  flusso_n8n_url text,
  attivo boolean DEFAULT true,
  ultima_esecuzione timestamptz,
  contatore_esecuzioni integer DEFAULT 0,
  gym_id uuid,
  creato_da uuid REFERENCES users(id),
  creato_il timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id uuid REFERENCES users(id),
  titolo text NOT NULL,
  messaggio text NOT NULL,
  tipo notification_type DEFAULT 'info',
  letta boolean DEFAULT false,
  azione_url text,
  metadata jsonb,
  creato_il timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Super Admin (can see everything)
CREATE POLICY "Super admin full access" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.ruolo = 'super_admin'
    )
  );

CREATE POLICY "Super admin members access" ON members
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.ruolo = 'super_admin'
    )
  );

-- RLS Policies for Admin (can see only their gym data)
CREATE POLICY "Admin gym access" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (u.ruolo = 'admin' AND users.gym_id = u.gym_id)
    )
  );

CREATE POLICY "Admin members access" ON members
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (u.ruolo IN ('admin', 'super_admin'))
      AND (u.ruolo = 'super_admin' OR members.gym_id = u.gym_id)
    )
  );

-- Similar policies for other tables
CREATE POLICY "Gym data access" ON areas
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (u.ruolo = 'super_admin' OR areas.gym_id = u.gym_id)
    )
  );

CREATE POLICY "Subscriptions access" ON subscriptions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN members m ON (u.ruolo = 'super_admin' OR m.gym_id = u.gym_id)
      WHERE u.id = auth.uid() AND subscriptions.member_id = m.id
    )
  );

CREATE POLICY "Courses access" ON courses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (u.ruolo = 'super_admin' OR courses.gym_id = u.gym_id)
    )
  );

CREATE POLICY "Bookings access" ON bookings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN members m ON (u.ruolo = 'super_admin' OR m.gym_id = u.gym_id)
      WHERE u.id = auth.uid() AND bookings.member_id = m.id
    )
  );

CREATE POLICY "Equipment access" ON equipments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (u.ruolo = 'super_admin' OR equipments.gym_id = u.gym_id)
    )
  );

CREATE POLICY "NFC tags access" ON nfc_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (u.ruolo = 'super_admin' OR nfc_tags.gym_id = u.gym_id)
    )
  );

CREATE POLICY "Access logs access" ON access_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (u.ruolo = 'super_admin' OR access_logs.gym_id = u.gym_id)
    )
  );

CREATE POLICY "Maintenance logs access" ON maintenance_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN equipments e ON (u.ruolo = 'super_admin' OR e.gym_id = u.gym_id)
      WHERE u.id = auth.uid() AND maintenance_logs.equipment_id = e.id
    )
  );

CREATE POLICY "Automations access" ON automations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND (u.ruolo = 'super_admin' OR automations.gym_id = u.gym_id)
    )
  );

CREATE POLICY "Notifications access" ON notifications
  FOR ALL TO authenticated
  USING (
    notifications.destinatario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.ruolo = 'super_admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_gym_id ON members(gym_id);
CREATE INDEX idx_members_stato ON members(stato);
CREATE INDEX idx_subscriptions_member_id ON subscriptions(member_id);
CREATE INDEX idx_subscriptions_attivo ON subscriptions(attivo);
CREATE INDEX idx_bookings_member_id ON bookings(member_id);
CREATE INDEX idx_bookings_data ON bookings(data);
CREATE INDEX idx_access_logs_member_id ON access_logs(member_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp_ingresso);
CREATE INDEX idx_nfc_tags_codice ON nfc_tags(codice_univoco);
CREATE INDEX idx_equipments_area_id ON equipments(area_id);
CREATE INDEX idx_equipments_stato ON equipments(stato);

-- Insert some sample data for testing
INSERT INTO users (nome, cognome, email, ruolo) VALUES
('Super', 'Admin', 'superadmin@gym.com', 'super_admin'),
('Admin', 'Gym1', 'admin@gym1.com', 'admin'),
('Trainer', 'Smith', 'trainer@gym1.com', 'trainer');

INSERT INTO areas (nome, descrizione, capacita_max) VALUES
('Sala Pesi', 'Area con attrezzi per il sollevamento pesi', 30),
('Cardio', 'Area con tapis roulant e cyclette', 20),
('Piscina', 'Vasca 25m per nuoto libero e corsi', 40),
('Sala Corsi', 'Spazio per corsi di gruppo', 25);